import { createClient } from '@supabase/supabase-js'
import AddDistrictForm from './AddDistrictForm'
import AddSchoolForm from './AddSchoolForm'
import RemoveSchoolButton from './RemoveSchoolButton'

function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

export default async function SetupPage() {
  const supabase = adminClient()
  const { data: districts } = await supabase
    .from('districts')
    .select('id, name, schools(id, name)')
    .order('name')

  return (
    <div className="space-y-8 max-w-2xl">
      <h1 className="text-2xl font-semibold text-gray-900">Districts &amp; Schools</h1>

      <div className="space-y-6">
        {(districts ?? []).map((district: any) => (
          <div key={district.id} className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="font-semibold text-gray-900 mb-3">{district.name}</h2>
            <ul className="space-y-1 mb-4">
              {(district.schools ?? [])
                .sort((a: any, b: any) => a.name.localeCompare(b.name))
                .map((school: any) => (
                  <li key={school.id} className="flex items-center text-sm text-gray-600 pl-3 border-l-2 border-gray-100">
                    <span className="flex-1">{school.name}</span>
                    <RemoveSchoolButton schoolId={school.id} schoolName={school.name} />
                  </li>
                ))}
            </ul>
            <AddSchoolForm districtId={district.id} />
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="font-semibold text-gray-900 mb-3">Add district</h2>
        <AddDistrictForm />
      </div>
    </div>
  )
}
