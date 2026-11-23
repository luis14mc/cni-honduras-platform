import { useState, type ChangeEvent } from 'react';
import { useFetchClient, useForm } from '@strapi/strapi/admin';
import { useLocation, useParams } from 'react-router-dom';
import { useIntl } from 'react-intl';

type Props = {
  name: string;
  value?: string | null;
  disabled?: boolean;
  onChange: (event: { target: { name: string; type: string; value: string } }) => void;
};

const copy = {
  es: {
    title: 'Archivo privado', hint: 'Para un recurso libre, use el campo Archivo.',
    save: 'Guarde el borrador con acceso con formulario antes de cargar el archivo.',
    ready: 'Archivo vinculado. Guarde el borrador antes de publicar.',
    current: 'El borrador tiene un archivo privado vinculado.',
    limit: 'PDF, DOCX, XLSX, PPTX o ZIP · hasta 25 MB',
    loading: 'Cargando archivo privado…',
    error: 'No se pudo cargar el archivo. Verifique el formato, el tamaño y que el borrador tenga acceso con formulario.',
  },
  en: {
    title: 'Private file', hint: 'Use the File field for a free resource.',
    save: 'Save the draft with gated access before uploading the file.',
    ready: 'File linked. Save the draft before publishing.',
    current: 'The draft has a private file linked.',
    limit: 'PDF, DOCX, XLSX, PPTX or ZIP · up to 25 MB',
    loading: 'Uploading private file…',
    error: 'Upload failed. Check the format, size, and that the draft was saved with gated access.',
  },
};

export default function PrivateResourceInput({ name, value, disabled, onChange }: Props) {
  const { id } = useParams();
  const { search } = useLocation();
  const { locale: adminLocale } = useIntl();
  const t = adminLocale.startsWith('es') ? copy.es : copy.en;
  const access = useForm('PrivateResourceInput', (state) => (state.values as { access?: string }).access);
  const documentLocale = useForm('PrivateResourceInput', (state) => (state.values as { locale?: string }).locale);
  const locale = new URLSearchParams(search).get('plugins[i18n][locale]') ?? documentLocale ?? 'es';
  const { post } = useFetchClient();
  const [state, setState] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const saved = Boolean(id && /^[a-z0-9]{1,64}$/.test(id) && id !== 'create');

  async function upload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0];
    event.currentTarget.value = '';
    if (!file || !saved || disabled || state === 'uploading') return;
    setState('uploading');
    try {
      const data = new FormData();
      data.append('file', file);
      const result = await post<{ key: string }>(`/content-manager/cni-private-upload/${id}?locale=${locale}`, data);
      onChange({ target: { name, type: 'string', value: result.data.key } });
      setState('success');
    } catch {
      setState('error');
    }
  }

  return (
    <div style={{ display: 'grid', gap: '0.5rem', fontSize: '0.875rem' }}>
      <label htmlFor={name} style={{ fontWeight: 600 }}>{t.title}</label>
      {access !== 'gated' ? <p>{t.hint}</p> : (
        <>
          <p id={`${name}-hint`}>{saved ? t.limit : t.save}</p>
          <input id={name} type="file" accept=".pdf,.docx,.xlsx,.pptx,.zip"
            aria-describedby={`${name}-hint`} disabled={disabled || !saved || state === 'uploading'} onChange={upload} />
          {state === 'error' ? <p role="alert">{t.error}</p> : (
            <p role="status">{state === 'uploading' ? t.loading : state === 'success' ? t.ready : value ? t.current : ''}</p>
          )}
        </>
      )}
    </div>
  );
}
