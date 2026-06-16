import { api } from './api'

export async function uploadToR2(file: File): Promise<string> {
  const { upload_url, public_url } = await api.post<{
    upload_url: string
    public_url: string
    key: string
  }>('/menu/upload-url', {
    filename: file.name,
    content_type: file.type,
  })

  await fetch(upload_url, {
    method: 'PUT',
    body: file,
    headers: { 'Content-Type': file.type },
  })

  return public_url
}
