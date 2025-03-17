import { createSupabaseServerClient } from '@/supabase/server'
import { User } from '@supabase/supabase-js'

export type UserWithAdmin = User & { isAdmin?: boolean }

export type GetUserOptions<T extends boolean> = {
  throwIfError: T
}

export type UserResponse<T extends boolean> = T extends true
  ? UserWithAdmin
  : UserWithAdmin | null

export async function getUser<T extends boolean>(
  options: GetUserOptions<T>
): Promise<UserResponse<T>> {
  const supabase = await createSupabaseServerClient()
  const { data: userData, error } = await supabase.auth.getUser()

  const userId = userData?.user?.id

  // Handle unauthorized cases
  if (!userId || error) {
    if (options.throwIfError) {
      throw new Error('Unauthorized')
    }
    return null as UserResponse<T>
  }

  // Transform user data
  const user = {
    ...userData.user,
    isAdmin: !!userData.user.app_metadata.is_admin
  } as UserResponse<T>

  return user
}
