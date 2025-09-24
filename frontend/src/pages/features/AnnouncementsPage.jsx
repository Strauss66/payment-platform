/**
 * Announcements management UI (admin + portal)
 * - Admin: create, list, edit, delete announcements with audience targeting and images
 * - Portal: read-only feed of visible announcements
 * - ImagePicker supports S3 presigned uploads and immediate previews by key
 */
import React, { useEffect, useMemo, useState } from 'react';
import { announcementsApi } from '../../lib/api.announcements';
import { useAuth } from '../../contexts/AuthContext';
import { presignImageUpload, putFile } from '../../lib/file';
import { listStudents, listTeachers, listFamilies } from '../../lib/api.billing';
import { useDebounce } from '../../hooks/useDebounce';
import { Table, THead, TR, TD } from '../../components/ui/Table';
import { ImagePlus } from 'lucide-react';
import { mediaUrl } from '../../lib/s3';

const SECTION_OPTIONS = [
  { value: 'preschool', label: 'Preschool' },
  { value: 'elementary', label: 'Elementary' },
  { value: 'middle', label: 'Middle' },
  { value: 'high', label: 'High' }
];

/** Root page that routes to Admin or Portal flavor based on roles */
export default function AnnouncementsPage(){
  const { user } = useAuth();
  const roles = user?.roles || [];
  const isAdmin = roles.includes('admin') || roles.includes('super_admin');
  return isAdmin ? <AdminAnnouncements /> : <PortalAnnouncements />;
}

/** Modal for editing a single announcement (local state mirrors DTO) */
function EditAnnouncementModal({ announcement, open, onClose, onSave }){
  const a = announcement || {};
  const [local, setLocal] = useState({
    title: a.title || '',
    body: a.body || '',
    category: a.category || 'other',
    audience_type: a.audience_type || 'school',
    entireSchool: a.audience_type === 'school',
    sections: Array.isArray(a.sections) ? a.sections : [],
    classIds: Array.isArray(a.classIds) ? a.classIds : [],
    studentIds: Array.isArray(a.studentIds) ? a.studentIds : [],
    roleKeys: Array.isArray(a.roleKeys) ? a.roleKeys : [],
    imageKeys: Array.isArray(a.imageKeys) ? a.imageKeys : [],
    startsAt: a.startsAt ? new Date(a.startsAt).toISOString().slice(0,16) : '',
    endsAt: a.endsAt ? new Date(a.endsAt).toISOString().slice(0,16) : ''
  });

  // Update local state if a changes (when switching rows)
  React.useEffect(()=>{
    if (!announcement) return;
    setLocal({
      title: a.title || '',
      body: a.body || '',
      category: a.category || 'other',
      audience_type: a.audience_type || 'school',
      entireSchool: a.audience_type === 'school',
      sections: Array.isArray(a.sections) ? a.sections : [],
      classIds: Array.isArray(a.classIds) ? a.classIds : [],
      studentIds: Array.isArray(a.studentIds) ? a.studentIds : [],
      roleKeys: Array.isArray(a.roleKeys) ? a.roleKeys : [],
      imageKeys: Array.isArray(a.imageKeys) ? a.imageKeys : [],
      startsAt: a.startsAt ? new Date(a.startsAt).toISOString().slice(0,16) : '',
      endsAt: a.endsAt ? new Date(a.endsAt).toISOString().slice(0,16) : ''
    });
  }, [announcement]);

  // Stable mapping of key->signedUrl from incoming row (for previews of existing images)
  const signedByKey = React.useMemo(() => {
    const map = {};
    const keys = Array.isArray(a.imageKeys) ? a.imageKeys : [];
    const signed = Array.isArray(a.imageSignedUrls) ? a.imageSignedUrls : [];
    keys.forEach((k, idx) => { if (signed[idx]) map[k] = signed[idx]; });
    const urls = Array.isArray(a.imageUrls) ? a.imageUrls : [];
    urls.forEach((u) => { map[u] = u; });
    return map;
  }, [a.imageKeys, a.imageSignedUrls, a.imageUrls]);

  if (!open) return null;

  const fmtToIso = (val) => val ? new Date(val).toISOString() : '';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[85vh] overflow-auto p-6">
        <h2 className="text-xl font-semibold mb-4">Edit Announcement</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Title</label>
            <input value={local.title} onChange={(e)=>setLocal({ ...local, title: e.target.value })} className="w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Body</label>
            <textarea value={local.body} onChange={(e)=>setLocal({ ...local, body: e.target.value })} className="w-full border rounded px-3 py-2" rows={3} />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Category</label>
            <select value={local.category} onChange={(e)=>setLocal({ ...local, category: e.target.value })} className="w-full border rounded px-3 py-2">
              <option value="payments">Payments</option>
              <option value="events">Events</option>
              <option value="activities">Activities</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">Audience</label>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={()=>setLocal({ ...local, entireSchool: true, audience_type: 'school', sections: [], classIds: [], studentIds: [], roleKeys: [] })} className={`px-3 py-1.5 rounded-full border ${local.entireSchool? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-900'}`}>Entire school</button>
              {['section','class','student'].map(key => (
                <button key={key} type="button" onClick={()=>setLocal({ ...local, audience_type: key, entireSchool:false })} className={`px-3 py-1.5 rounded-full border ${local.audience_type===key && !local.entireSchool ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-900'}`}>{key.charAt(0).toUpperCase()+key.slice(1)}</button>
              ))}
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {['teachers','parents'].map(r => (
                <button key={r} type="button" onClick={()=>{
                  const current = local.roleKeys || [];
                  const exists = current.includes(r);
                  const next = exists ? current.filter(x=>x!==r) : [...current, r];
                  setLocal({ ...local, roleKeys: next, entireSchool: false });
                }} className={`px-3 py-1.5 rounded-full border ${(local.roleKeys||[]).includes(r)? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-900'}`}>{r.charAt(0).toUpperCase()+r.slice(1)}</button>
              ))}
            </div>
            {local.audience_type === 'section' && (
              <div className="mt-2">
                <label className="block text-sm text-gray-600 mb-1">Sections</label>
                <div className="flex flex-wrap gap-2">
                  {SECTION_OPTIONS.map(opt => (
                    <button key={opt.value} type="button" className={`px-3 py-1.5 rounded border ${local.sections.includes(opt.value) ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-900'}`} onClick={()=>{
                      const has = local.sections.includes(opt.value);
                      const next = has ? local.sections.filter(x=>x!==opt.value) : [...local.sections, opt.value];
                      setLocal({ ...local, sections: next, entireSchool:false });
                    }}>{opt.label}</button>
                  ))}
                </div>
              </div>
            )}
            {local.audience_type === 'class' && (
              <div className="mt-2">
                <label className="block text-sm text-gray-600 mb-1">Classes (IDs)</label>
                <input value={local.classIds.join(',')} onChange={(e)=>setLocal({ ...local, classIds: e.target.value.split(',').map(v=>Number(v)).filter(Boolean), entireSchool:false })} placeholder="e.g. 1,2,3" className="w-full border rounded px-3 py-2" />
              </div>
            )}
            {local.audience_type === 'student' && (
              <div className="mt-2">
                <label className="block text-sm text-gray-600 mb-1">Students (IDs)</label>
                <input value={local.studentIds.join(',')} onChange={(e)=>setLocal({ ...local, studentIds: e.target.value.split(',').map(v=>Number(v)).filter(Boolean), entireSchool:false })} placeholder="e.g. 10,11" className="w-full border rounded px-3 py-2" />
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">Images</label>
            <ImagePicker images={local.imageKeys} onChange={(imageKeys)=>setLocal({ ...local, imageKeys })} signedUrlsByKey={signedByKey} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Starts At</label>
              <input type="datetime-local" value={local.startsAt} onChange={(e)=>setLocal({ ...local, startsAt: e.target.value })} className="w-full border rounded px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Ends At</label>
              <input type="datetime-local" value={local.endsAt} onChange={(e)=>setLocal({ ...local, endsAt: e.target.value })} className="w-full border rounded px-3 py-2" />
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 rounded border">Cancel</button>
          <button onClick={()=>{
            onSave({
              ...local,
              // ensure ISO strings on save
              startsAt: local.startsAt ? new Date(local.startsAt).toISOString() : '',
              endsAt: local.endsAt ? new Date(local.endsAt).toISOString() : ''
            });
          }} className="px-4 py-2 rounded bg-violet-600 text-white">Save</button>
        </div>
      </div>
    </div>
  );
}

/** Portal view of announcements visible to the current user */
function PortalAnnouncements(){
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    (async () => {
      try {
        const { data } = await announcementsApi.feed({ limit: 50 });
        const list = Array.isArray(data?.rows) ? data.rows : Array.isArray(data) ? data : [];
        const sorted = list.slice().sort((a,b)=>{
          const s = new Date(a.startsAt) - new Date(b.startsAt);
          if (s !== 0) return s;
          return new Date(b.createdAt) - new Date(a.createdAt);
        });
        setRows(sorted);
      } finally {
        setLoading(false);
      }
    })();
  }, []);
  if (loading) return <div>Loading…</div>;
  if (!rows.length) return <EmptyState />;
  const fmt = new Intl.DateTimeFormat(undefined, { dateStyle:'medium', timeStyle:'short' });
  return (
    <div className="space-y-3">
      {rows.map(a => (
        <article key={a.id} className="p-4 rounded-lg border bg-white">
          <div className="text-xs text-gray-500 mb-1">{capitalize(a.category)} · {a.status}</div>
          <h3 className="text-lg font-semibold">{a.title}</h3>
          {a.body && <p className="text-gray-700 whitespace-pre-wrap mt-1">{a.body}</p>}
          {(() => {
            const imgs = resolveAnnouncementImages(a);
            return imgs.length > 0;
          })() && (
            <div className="mt-2 flex gap-2 flex-wrap">
              {resolveAnnouncementImages(a).map((src, i) => (
                <img
                  key={i}
                  src={src}
                  alt={a.imageAlts?.[i] || ''}
                  loading="lazy"
                  referrerPolicy="no-referrer"
                  onError={(e)=>{ e.currentTarget.style.display='none'; }}
                  className="w-24 h-24 object-cover rounded border"
                />
              ))}
            </div>
          )}
          <div className="mt-2 text-xs text-gray-500">
            {fmt.format(new Date(a.startsAt))}
            {a.endsAt ? ` → ${fmt.format(new Date(a.endsAt))}` : ''}
          </div>
        </article>
      ))}
    </div>
  );
}

/** Admin view: create form and list with actions */
function AdminAnnouncements(){
  const [rows, setRows] = useState([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
  const [form, setForm] = useState({
    title: '', body: '', category: 'other', audience_type: 'school',
    entireSchool: true,
    sections: [], classIds: [], studentIds: [], roleKeys: [], imageKeys: [], startsAt: '', endsAt: ''
  });

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await announcementsApi.list({ limit: 100 });
      const items = (data?.rows || []).slice().sort((a,b)=>{
        const s = new Date(a.startsAt) - new Date(b.startsAt);
        if (s !== 0) return s;
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
      setRows(items);
      setCount(data?.count || 0);
    } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const isValid = useMemo(() => {
    if (!form.title?.trim() || !form.body?.trim() || !form.category || !form.startsAt) return false;
    if (form.audience_type === 'section' && form.sections.length === 0) return false;
    if (form.audience_type === 'class' && form.classIds.length === 0) return false;
    if (form.audience_type === 'student' && form.studentIds.length === 0) return false;
    const anyAudience = form.entireSchool || form.sections.length || form.classIds.length || form.studentIds.length || form.roleKeys.length;
    if (!anyAudience) return false;
    if (form.imageKeys.length > 3) return false;
    if (form.endsAt && new Date(form.endsAt) <= new Date(form.startsAt)) return false;
    return true;
  }, [form]);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!isValid) return;
    try {
      await announcementsApi.create({
        title: form.title,
        body: form.body,
        category: form.category,
        entireSchool: !!form.entireSchool,
        audience_type: form.entireSchool ? 'school' : form.audience_type,
        sections: form.sections.length ? form.sections : undefined,
        classIds: form.classIds.length ? form.classIds : undefined,
        studentIds: form.studentIds.length ? form.studentIds : undefined,
        roleKeys: form.roleKeys.length ? form.roleKeys : undefined,
        imageKeys: form.imageKeys.length ? form.imageKeys : undefined,
        startsAt: form.startsAt,
        endsAt: form.endsAt || null
      });
      setForm({ title: '', body: '', category: 'other', audience_type: 'school', entireSchool: true, sections: [], classIds: [], studentIds: [], roleKeys: [], imageKeys: [], startsAt: '', endsAt: '' });
      await load();
    } catch (err) {
      const msg = err?.response?.data?.message || err?.response?.data?.code || err?.message || 'Failed to create announcement';
      alert(msg);
    }
  };

  const onDelete = async (id) => {
    if (!window.confirm('Delete this announcement?')) return;
    try { await announcementsApi.remove(id); await load(); } catch { alert('Delete failed'); }
  };

  const onEdit = (a) => {
    setEditingAnnouncement(a);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Announcements</h1>

      <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6 border rounded-lg bg-white">
        <div className="md:col-span-2">
          <label className="block text-sm text-gray-600 mb-1">Title</label>
          <input value={form.title} onChange={(e)=>setForm({ ...form, title: e.target.value })} className="w-full border rounded px-3 py-2" required />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm text-gray-600 mb-1">Body</label>
          <textarea value={form.body} onChange={(e)=>setForm({ ...form, body: e.target.value })} className="w-full border rounded px-3 py-2" rows={3} required />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">Category</label>
          <select value={form.category} onChange={(e)=>setForm({ ...form, category: e.target.value })} className="w-full border rounded px-3 py-2">
            <option value="payments">Payments</option>
            <option value="events">Events</option>
            <option value="activities">Activities</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">Audience</label>
          <div className="flex flex-col gap-2">
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={()=>{
                const nextEntire = !form.entireSchool;
                if (nextEntire) {
                  setForm({ ...form, entireSchool: true, audience_type: 'school', sections: [], classIds: [], studentIds: [], roleKeys: [] });
                } else {
                  setForm({ ...form, entireSchool: false });
                }
              }} className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border ${form.entireSchool? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-900'}`}>
                <input type="checkbox" checked={!!form.entireSchool} onChange={()=>{}} className="hidden" />
                Entire school
              </button>
              {[
                { key: 'section', label: 'Sections' },
                { key: 'class', label: 'Classes' },
                { key: 'student', label: 'Students' }
              ].map(opt => (
                <button key={opt.key} type="button" onClick={()=>setForm({ ...form, audience_type: opt.key, entireSchool:false })} className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border ${form.audience_type===opt.key && !form.entireSchool ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-900'}`}>
                  <input type="radio" name="aud" checked={form.audience_type===opt.key && !form.entireSchool} onChange={()=>{}} className="hidden" />
                  {opt.label}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              {['teachers','parents'].map(r => (
                <button key={r} type="button" onClick={()=>{
                  const current = form.roleKeys || [];
                  const exists = current.includes(r);
                  const next = exists ? current.filter(x=>x!==r) : [...current, r];
                  setForm({ ...form, roleKeys: next, entireSchool: false });
                }} className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border ${(form.roleKeys||[]).includes(r)? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-900'}`}>
                  {r.charAt(0).toUpperCase()+r.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>
        {form.audience_type === 'section' && (
          <div className="md:col-span-2">
            <label className="block text-sm text-gray-600 mb-1">Sections</label>
            <div className="flex flex-wrap gap-2">
              {SECTION_OPTIONS.map(opt => (
                <button type="button" key={opt.value} className={`inline-flex items-center gap-2 px-3 py-1.5 rounded border ${form.sections.includes(opt.value) ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-900'}`} onClick={()=>{
                  const has = form.sections.includes(opt.value);
                  const next = has ? form.sections.filter(x=>x!==opt.value) : [...form.sections, opt.value];
                  setForm({ ...form, sections: next, entireSchool: false });
                }}>{opt.label}</button>
              ))}
            </div>
          </div>
        )}
        {form.audience_type === 'class' && (
          <div className="md:col-span-2">
            <label className="block text-sm text-gray-600 mb-1">Classes (IDs)</label>
            <input value={form.classIds.join(',')} onChange={(e)=>setForm({ ...form, classIds: e.target.value.split(',').map(v=>Number(v)).filter(Boolean), entireSchool: false })} placeholder="e.g. 1,2,3" className="w-full border rounded px-3 py-2" />
          </div>
        )}

        {/* Audience Tables */}
        {form.audience_type === 'student' && (
          <AudienceStudents
            selectedIds={form.studentIds}
            onToggle={(id)=>{
              const has = form.studentIds.includes(id);
              const next = has ? form.studentIds.filter(x=>x!==id) : [...form.studentIds, id];
              setForm({ ...form, studentIds: next, entireSchool: false });
            }}
          />
        )}

        {(form.roleKeys||[]).includes('teachers') && (
          <AudienceTeachers />
        )}

        {(form.roleKeys||[]).includes('parents') && (
          <AudienceParents />
        )}
        {form.audience_type === 'student' && (
          <div className="md:col-span-2">
            <label className="block text-sm text-gray-600 mb-1">Students (IDs)</label>
            <input value={form.studentIds.join(',')} onChange={(e)=>setForm({ ...form, studentIds: e.target.value.split(',').map(v=>Number(v)).filter(Boolean) })} placeholder="e.g. 10,11" className="w-full border rounded px-3 py-2" />
          </div>
        )}
        <div className="md:col-span-2">
          <label className="block text-sm text-gray-600 mb-1">Images (up to 3)</label>
          <ImagePicker images={form.imageKeys} onChange={(imageKeys)=>setForm({ ...form, imageKeys })} />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">Starts At</label>
          <input type="datetime-local" value={form.startsAt} onChange={(e)=>setForm({ ...form, startsAt: e.target.value })} className="w-full border rounded px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">Ends At</label>
          <input type="datetime-local" value={form.endsAt} onChange={(e)=>setForm({ ...form, endsAt: e.target.value })} className="w-full border rounded px-3 py-2" />
          {form.endsAt && form.startsAt && new Date(form.endsAt) <= new Date(form.startsAt) && (
            <div className="text-xs text-red-600 mt-1">Ends At must be after Starts At</div>
          )}
        </div>
        <div className="md:col-span-2">
          <button type="submit" disabled={!isValid} className="px-4 py-2 rounded bg-violet-600 text-white disabled:opacity-50">Create</button>
        </div>
      </form>

      <div className="space-y-3">
        {loading ? <div>Loading…</div> : rows.length === 0 ? <EmptyState /> : rows.map(a => (
          <div key={a.id} className="p-4 border rounded-lg bg-white flex items-center gap-4">
            {/* Images gallery (up to 3) */}
            <div className="shrink-0">
              {(() => {
                const imgs = resolveAnnouncementImages(a);
                if (!imgs.length) {
                  return (
                    <div className="w-28 h-20 rounded-lg overflow-hidden border bg-gray-50 grid place-items-center">
                      <span className="text-xs text-gray-500">No image</span>
                    </div>
                  );
                }
                return (
                  <div className="flex gap-2">
                    {imgs.slice(0,3).map((src, i) => (
                      <img
                        key={`${src}-${i}`}
                        src={src}
                        alt={a.imageAlts?.[i] || `image ${i+1}`}
                        loading="lazy"
                        referrerPolicy="no-referrer"
                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                        className="w-24 h-20 object-cover rounded-lg border"
                      />
                    ))}
                  </div>
                );
              })()}
            </div>
            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <span className="uppercase tracking-wide inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold" style={{ backgroundColor: badgeColor(a.status).bg, color: badgeColor(a.status).fg }}>{(a.status||'').toUpperCase()}</span>
                <span>{capitalize(a.category)}</span>
              </div>
              <div className="mt-1 font-semibold truncate">{a.title}</div>
              {a.body && <div className="text-gray-700 text-sm mt-0.5 line-clamp-2">{a.body}</div>}
              <div className="text-xs text-gray-500 mt-1">{a.audienceSummary}</div>
              <div className="text-xs text-gray-500 mt-1">
                {(() => { const fmt = new Intl.DateTimeFormat(undefined, { dateStyle:'medium', timeStyle:'short' }); return `${fmt.format(new Date(a.startsAt))}${a.endsAt ? ` → ${fmt.format(new Date(a.endsAt))}` : ''}`; })()}
              </div>
            </div>
            {/* Actions */}
            <div className="shrink-0 flex items-center gap-3">
              <button onClick={()=>onEdit(a)} className="text-sm text-blue-600">Edit</button>
              <button onClick={()=>onDelete(a.id)} className="text-sm text-red-600">Delete</button>
            </div>
          </div>
        ))}
      </div>

      <EditAnnouncementModal
        open={!!editingAnnouncement}
        announcement={editingAnnouncement}
        onClose={()=> setEditingAnnouncement(null)}
        onSave={async (updated) => {
          if (!editingAnnouncement) return;
          try {
            await announcementsApi.update(editingAnnouncement.id, {
              title: updated.title,
              body: updated.body,
              category: updated.category,
              entireSchool: !!updated.entireSchool,
              audience_type: updated.entireSchool ? 'school' : updated.audience_type,
              sections: updated.sections?.length ? updated.sections : undefined,
              classIds: updated.classIds?.length ? updated.classIds : undefined,
              studentIds: updated.studentIds?.length ? updated.studentIds : undefined,
              roleKeys: updated.roleKeys?.length ? updated.roleKeys : undefined,
              imageKeys: updated.imageKeys?.length ? updated.imageKeys : undefined,
              startsAt: updated.startsAt,
              endsAt: updated.endsAt || null
            });
            setEditingAnnouncement(null);
            await load();
          } catch (e) {
            alert('Update failed');
          }
        }}
      />
    </div>
  );
}

/** Small empty-state placeholder */
function EmptyState(){
  return (
    <div className="p-8 rounded border text-center text-gray-600 bg-white">
      <div className="font-medium mb-1">No announcements yet</div>
      <div className="text-sm">Create your first announcement to inform your school community.</div>
    </div>
  );
}

/** Capitalize helper */
function capitalize(s){ return String(s||'').charAt(0).toUpperCase()+String(s||'').slice(1); }

/** Badge color palette by status */
function badgeColor(status){
  const key = String(status || '').toLowerCase();
  switch (key) {
    case 'upcoming':
    case 'scheduled':
      return { bg: '#E6F9EF', fg: '#137A4D' };
    case 'active':
    case 'published':
      return { bg: '#E8F1FF', fg: '#1D4ED8' };
    case 'draft':
      return { bg: '#F3F4F6', fg: '#374151' };
    case 'ended':
    case 'expired':
      return { bg: '#F3F4F6', fg: '#6B7280' };
    case 'cancelled':
    case 'canceled':
      return { bg: '#FDECEC', fg: '#B91C1C' };
    default:
      return { bg: '#F3F4F6', fg: '#374151' };
  }
}

/** Resolve announcement images preferring signed → urls → mediaUrl(keys) */
function resolveAnnouncementImages(a){
  if (Array.isArray(a.imageSignedUrls) && a.imageSignedUrls.length) return a.imageSignedUrls;
  if (Array.isArray(a.imageUrls) && a.imageUrls.length) return a.imageUrls;
  if (Array.isArray(a.imageKeys) && a.imageKeys.length) return a.imageKeys.map(k => mediaUrl(k));
  return [];
}

/**
 * ImagePicker
 * - Uploads up to 3 images via presigned PUT
 * - Shows immediate objectURL previews, keyed by S3 key
 * - Uses signedUrlsByKey or mediaUrl fallback for existing keys
 */
function ImagePicker({ images, onChange, signedUrlsByKey = {} }){
  const [uploading, setUploading] = useState(false);
  const [previewMap, setPreviewMap] = useState({}); // { [key:string]: objectUrl }
  React.useEffect(() => () => {
    // cleanup object URLs on unmount
    Object.values(previewMap).forEach(u => { try { URL.revokeObjectURL(u); } catch {} });
  }, []);

  async function handleFile(file){
    if (!file) return;
    if (!['image/png','image/jpeg','image/webp'].includes(file.type)) return alert('Only PNG/JPEG/WebP allowed');
    if (file.size > 5*1024*1024) return alert('Max size 5MB');
    if ((images||[]).length >= 3) return;
    try {
      setUploading(true);
      // get key first
      const { uploadUrl, key } = await presignImageUpload(file.type, file.size);
      // set immediate local preview for that key
      const objectUrl = URL.createObjectURL(file);
      setPreviewMap(prev => ({ ...prev, [key]: objectUrl }));
      // upload
      await putFile(uploadUrl, file, file.type);
      // append key to images (cap 3)
      onChange([...(images||[]), key].slice(0,3));
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Upload failed';
      alert(msg);
    } finally {
      setUploading(false);
    }
  }

  function onInputChange(e){
    const file = e.target.files?.[0];
    e.target.value = '';
    handleFile(file);
  }

  function onDrop(e){
    e.preventDefault();
    if (uploading) return;
    const file = e.dataTransfer.files?.[0];
    handleFile(file);
  }

  function removeAt(i){
    const next = (images||[]).slice();
    const [removed] = next.splice(i,1);
    onChange(next);
    if (removed && previewMap[removed]) {
      try { URL.revokeObjectURL(previewMap[removed]); } catch {}
    }
    setPreviewMap(pm => {
      const { [removed]: _, ...rest } = pm || {};
      return rest;
    });
  }

  const canAdd = (images||[]).length < 3;

  return (
    <div>
      <div
        onDragOver={(e)=>{ e.preventDefault(); }}
        onDrop={onDrop}
        className="border-2 border-dashed rounded-lg p-4 min-h-[120px] flex items-center justify-center bg-gray-50"
      >
        <div className="w-full">
          {(images||[]).length === 0 && (
            <label className="w-full flex flex-col items-center justify-center gap-1 text-gray-600 cursor-pointer">
              <ImagePlus className="size-5" />
              <span>Add Image</span>
              <input type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={onInputChange} disabled={uploading || !canAdd} />
            </label>
          )}
          {(images||[]).length > 0 && (
            <div className="flex gap-3 flex-wrap">
              {(images||[]).map((key, i) => (
                <div key={`${key}-${i}`} className="relative">
                  {(() => {
                    const src = previewMap[key] || (signedUrlsByKey?.[key]) || (key ? mediaUrl(key) : null);
                    if (src) {
                      return <img src={src} alt={`Image ${i+1}`} className="w-28 h-28 object-cover rounded border" />;
                    }
                    return (
                      <div className="w-28 h-28 bg-gray-100 rounded border flex items-center justify-center">
                        <span className="text-xs text-gray-500">Image {i+1}</span>
                      </div>
                    );
                  })()}
                  <button type="button" onClick={()=>removeAt(i)} className="absolute -top-2 -right-2 bg-white border rounded-full w-6 h-6 text-sm">×</button>
                </div>
              ))}
              {canAdd && (
                <label className="inline-flex items-center justify-center w-28 h-28 border rounded cursor-pointer bg-gray-50">
                  <span className="text-sm text-gray-600">Add image</span>
                  <input type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={onInputChange} disabled={uploading} />
                </label>
              )}
            </div>
          )}
        </div>
      </div>
      {uploading && <div className="text-xs text-gray-500 mt-1">Uploading…</div>}
    </div>
  );
}


function AudienceStudents({ selectedIds = [], onToggle }){
  const [q, setQ] = useState('');
  const [limit, setLimit] = useState(10);
  const [offset, setOffset] = useState(0);
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [state, setState] = useState('idle');
  const debouncedQ = useDebounce(q, 300);

  async function load(){
    setState('loading');
    try {
      const { rows, count } = await listStudents({ q: debouncedQ || undefined, limit, offset, sort: 'id:desc' });
      setRows(rows); setTotal(count ?? rows.length); setState('idle');
    } catch { setState('error'); }
  }

  useEffect(() => { load(); }, [debouncedQ, limit, offset]);

  return (
    <div className="md:col-span-2">
      <div className="flex items-end gap-3 mb-2">
        <div>
          <label className="text-xs block mb-1">Search students</label>
          <input value={q} onChange={e=>{ setQ(e.target.value); setOffset(0); }} placeholder="Name or enrollment…" className="border rounded px-3 py-2 w-64" />
        </div>
        <div>
          <label className="text-xs block mb-1">Rows</label>
          <select value={limit} onChange={e=>{ setLimit(Number(e.target.value)); setOffset(0); }} className="border rounded px-2 py-2">
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>
        </div>
      </div>
      {state === 'loading' ? (
        <div className="text-sm text-gray-500">Loading…</div>
      ) : state === 'error' ? (
        <div className="text-sm text-red-600">Failed to load students.</div>
      ) : (
        <Table head={<THead sticky columns={[{label:''}, {label:'Name'}, {label:'Enrollment #'}, {label:'Status'}]} /> }>
          {rows.map(r => (
            <TR key={r.id}>
              <TD>
                <input type="checkbox" checked={selectedIds.includes(r.id)} onChange={()=>onToggle(r.id)} />
              </TD>
              <TD>{r.name || `${r.first_name || ''} ${r.last_name || ''}`}</TD>
              <TD>{r.enrollment_no || '-'}</TD>
              <TD>{r.status || '-'}</TD>
            </TR>
          ))}
        </Table>
      )}
      <div className="flex items-center justify-between mt-2 text-sm">
        <div>Showing {offset + 1} - {Math.min(offset + limit, total)} of {total}</div>
        <div className="flex gap-2">
          <button type="button" className="px-2 py-1 border rounded" onClick={()=> setOffset(Math.max(0, offset - limit))} disabled={offset===0}>Prev</button>
          <button type="button" className="px-2 py-1 border rounded" onClick={()=> setOffset(offset + limit)} disabled={offset + limit >= total}>Next</button>
        </div>
      </div>
    </div>
  );
}

function AudienceTeachers(){
  const [q, setQ] = useState('');
  const [limit, setLimit] = useState(10);
  const [offset, setOffset] = useState(0);
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [state, setState] = useState('idle');
  const debouncedQ = useDebounce(q, 300);

  async function load(){
    setState('loading');
    try {
      const { rows, count } = await listTeachers({ q: debouncedQ || undefined, limit, offset, sort: 'id:desc' });
      setRows(rows); setTotal(count ?? rows.length); setState('idle');
    } catch { setState('error'); }
  }

  useEffect(() => { load(); }, [debouncedQ, limit, offset]);

  return (
    <div className="md:col-span-2">
      <div className="flex items-end gap-3 mb-2">
        <div>
          <label className="text-xs block mb-1">Search teachers</label>
          <input value={q} onChange={e=>{ setQ(e.target.value); setOffset(0); }} placeholder="Name or email…" className="border rounded px-3 py-2 w-64" />
        </div>
        <div>
          <label className="text-xs block mb-1">Rows</label>
          <select value={limit} onChange={e=>{ setLimit(Number(e.target.value)); setOffset(0); }} className="border rounded px-2 py-2">
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>
        </div>
      </div>
      {state === 'loading' ? (
        <div className="text-sm text-gray-500">Loading…</div>
      ) : state === 'error' ? (
        <div className="text-sm text-red-600">Failed to load teachers.</div>
      ) : (
        <Table head={<THead sticky columns={[{label:'Name'}, {label:'Department'}, {label:'Email'}]} /> }>
          {rows.map(r => (
            <TR key={r.id}>
              <TD>{r.name || `${r.first_name || ''} ${r.last_name || ''}`}</TD>
              <TD>{r.department || r.grade || '-'}</TD>
              <TD>{r.email || '-'}</TD>
            </TR>
          ))}
        </Table>
      )}
      <div className="flex items-center justify-between mt-2 text-sm">
        <div>Showing {offset + 1} - {Math.min(offset + limit, total)} of {total}</div>
        <div className="flex gap-2">
          <button type="button" className="px-2 py-1 border rounded" onClick={()=> setOffset(Math.max(0, offset - limit))} disabled={offset===0}>Prev</button>
          <button type="button" className="px-2 py-1 border rounded" onClick={()=> setOffset(offset + limit)} disabled={offset + limit >= total}>Next</button>
        </div>
      </div>
    </div>
  );
}

function AudienceParents(){
  const [q, setQ] = useState('');
  const [limit, setLimit] = useState(10);
  const [offset, setOffset] = useState(0);
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [state, setState] = useState('idle');
  const debouncedQ = useDebounce(q, 300);

  async function load(){
    setState('loading');
    try {
      const { rows, count } = await listFamilies({ q: debouncedQ || undefined, limit, offset, sort: 'id:desc' });
      setRows(rows); setTotal(count ?? rows.length); setState('idle');
    } catch { setState('error'); }
  }

  useEffect(() => { load(); }, [debouncedQ, limit, offset]);

  return (
    <div className="md:col-span-2">
      <div className="flex items-end gap-3 mb-2">
        <div>
          <label className="text-xs block mb-1">Search parents</label>
          <input value={q} onChange={e=>{ setQ(e.target.value); setOffset(0); }} placeholder="Guardian surname…" className="border rounded px-3 py-2 w-64" />
        </div>
        <div>
          <label className="text-xs block mb-1">Rows</label>
          <select value={limit} onChange={e=>{ setLimit(Number(e.target.value)); setOffset(0); }} className="border rounded px-2 py-2">
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>
        </div>
      </div>
      {state === 'loading' ? (
        <div className="text-sm text-gray-500">Loading…</div>
      ) : state === 'error' ? (
        <div className="text-sm text-red-600">Failed to load parents.</div>
      ) : (
        <Table head={<THead sticky columns={[{label:'Family'}, {label:'Guardians'}, {label:'Students'}]} /> }>
          {rows.map(r => (
            <TR key={r.id}>
              <TD>#{r.code || r.id}</TD>
              <TD>{Array.isArray(r.guardians)? r.guardians.map(g=>g.name).join(', ') : '-'}</TD>
              <TD>{Array.isArray(r.students)? r.students.length : (r.students_count ?? '-')}</TD>
            </TR>
          ))}
        </Table>
      )}
      <div className="flex items-center justify-between mt-2 text-sm">
        <div>Showing {offset + 1} - {Math.min(offset + limit, total)} of {total}</div>
        <div className="flex gap-2">
          <button type="button" className="px-2 py-1 border rounded" onClick={()=> setOffset(Math.max(0, offset - limit))} disabled={offset===0}>Prev</button>
          <button type="button" className="px-2 py-1 border rounded" onClick={()=> setOffset(offset + limit)} disabled={offset + limit >= total}>Next</button>
        </div>
      </div>
    </div>
  );
}

