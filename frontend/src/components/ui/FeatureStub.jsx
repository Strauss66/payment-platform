import React from 'react';
import PageHeader from './PageHeader.tsx';
import EmptyState from './EmptyState.jsx';

export default function FeatureStub({ title = 'Coming soon', description = 'This feature is not available yet.' }){
  return (
    <div className="space-y-4">
      <PageHeader title={title} />
      <div className="rounded-2xl border bg-white p-8">
        <EmptyState
          title={title}
          description={description}
        />
      </div>
    </div>
  );
}


