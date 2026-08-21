interface snippetPropsId {
  params: Promise<{
    id: string;
  }>;
}

export default async function snippetEditPage({ params }: snippetPropsId) {
  const { id } = await params;
  return <div>Edit snippet with id {id}</div>;
}
