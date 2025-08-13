import React, { useEffect, useMemo, useState } from 'react';
import { api } from '../../lib/apiClient';

export default function CoursesDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [student, setStudent] = useState(null);
  const [current, setCurrent] = useState([]);
  const [past, setPast] = useState([]);
  const [favorites, setFavorites] = useState(() => {
    try {
      const raw = localStorage.getItem('course_favorites');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    async function fetchCourses() {
      setLoading(true);
      setError(null);
      try {
        const { data } = await api.get('/api/courses/me');
        setStudent(data.student || null);
        setCurrent(Array.isArray(data.current) ? data.current : []);
        setPast(Array.isArray(data.past) ? data.past : []);
      } catch (err) {
        setError(err?.response?.data?.message || 'Failed to load courses');
      } finally {
        setLoading(false);
      }
    }
    fetchCourses();
  }, []);

  useEffect(() => {
    try { localStorage.setItem('course_favorites', JSON.stringify(favorites)); } catch {}
  }, [favorites]);

  const toggleFavorite = (courseId) => {
    setFavorites((prev) => prev.includes(courseId)
      ? prev.filter((id) => id !== courseId)
      : [...prev, courseId]);
  };

  const allCourses = useMemo(() => current, [current]);

  if (loading) return <div className="p-6">Loading courses…</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;

  return (
    <div className="p-6">
      {!!student && (
        <div className="mb-5 text-sm text-gray-600">
          <span className="font-medium text-gray-800">{student.first_name} {student.last_name}</span>
          <span className="mx-2">•</span>
          <span>Grade: {student.grade || '—'}</span>
        </div>
      )}
      <h1 className="text-3xl font-semibold mb-6">All Courses</h1>
      <CoursesTable courses={allCourses} favorites={favorites} onToggleFavorite={toggleFavorite} />

      <h2 className="text-2xl font-semibold mt-10 mb-4">Past Enrollments</h2>
      <CoursesTable courses={past} favorites={favorites} onToggleFavorite={toggleFavorite} />
    </div>
  );
}

function CoursesTable({ courses, favorites, onToggleFavorite }) {
  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <Th>Favorite</Th>
            <Th>Course</Th>
            <Th>Nickname</Th>
            <Th>Term</Th>
            <Th>Enrolled as</Th>
            <Th>Published</Th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {courses?.length === 0 && (
            <tr>
              <td colSpan={6} className="p-6 text-center text-gray-500">No courses</td>
            </tr>
          )}
          {courses?.map((c, idx) => (
            <tr key={c.id ?? idx} className={idx % 2 === 1 ? 'bg-gray-50/40 hover:bg-gray-50' : 'hover:bg-gray-50'}>
              <Td>
                <button
                  onClick={() => onToggleFavorite(c.id)}
                  className={favoriteClass(favorites.includes(c.id))}
                  aria-label="Toggle favorite"
                >★</button>
              </Td>
              <Td>
                <div className="flex items-center gap-2">
                  <span className={`inline-block w-2.5 h-2.5 rounded-sm ${colorDot(c.id)}`} />
                  <span className="text-blue-700 hover:underline cursor-pointer">{c.name}</span>
                </div>
              </Td>
              <Td className="text-gray-400">—</Td>
              <Td>{c.term ?? '—'}</Td>
              <Td>Student</Td>
              <Td>{c.published === false ? 'No' : 'Yes'}</Td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Th({ children }) {
  return (
    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
      {children}
    </th>
  );
}

function Td({ children, className = '' }) {
  return (
    <td className={`px-4 py-3 text-sm text-gray-700 ${className}`}>{children}</td>
  );
}

function favoriteClass(active) {
  return `text-xl ${active ? 'text-yellow-400' : 'text-gray-300'} hover:text-yellow-400`;
}

function colorDot(id){
  const colors = ['bg-blue-600','bg-green-600','bg-amber-600','bg-rose-600','bg-violet-600','bg-teal-600'];
  if (!id && id !== 0) return colors[0];
  const idx = Math.abs(Number(id)) % colors.length;
  return colors[idx];
}


