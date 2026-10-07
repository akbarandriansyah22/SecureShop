import { CreateCategoryForm, DeleteCategory } from "@/components/admin/category-actions";
import { getCategories } from "@/lib/api";

export default async function Page() {
  const categories = await getCategories();

  return (
    <section className="mx-auto max-w-6xl space-y-4 px-4 py-10">
      <h1 className="font-serif text-4xl font-normal">Categories</h1>
      <CreateCategoryForm />
      {categories.error !== null ? (
        <p className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">{categories.error}</p>
      ) : categories.data.length === 0 ? (
        <p className="text-sm text-neutral-600">Belum ada kategori.</p>
      ) : (
        <ul className="space-y-2">
          {categories.data.map((category) => (
            <li key={category.id} className="flex items-center justify-between rounded border border-neutral-200 bg-white p-4">
              <span>
                {category.name} <span className="text-sm text-neutral-600">/{category.slug}</span>
              </span>
              <DeleteCategory id={category.id} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
