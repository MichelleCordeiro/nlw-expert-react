import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { ChangeEvent, FormEvent, useState } from 'react';
import { toast } from 'sonner'

interface NewNoteCardProps {
  onNoteCreated: (content: string) => void
}

let speechRecognition: SpeechRecognition | null = null

export function NewNoteCard({ onNoteCreated }: NewNoteCardProps) {
  const [shouldShowOnBoard, setShouldShowOnBoarding] = useState(true)
  const [content, setContent] = useState('')
  const [isRecording, setIsRecording] = useState(false)

  function handleStartEditor() {
    setShouldShowOnBoarding(false)
  }

  // volta ao modal anterior caso o texto da textarea sela apagado
  function handleContentChanged(event: ChangeEvent<HTMLTextAreaElement>) {
    setContent(event.target.value)

    if (event.target.value === '') {
      setShouldShowOnBoarding(true)
    }
  }

  function handleSaveNote(event: FormEvent) {
    event.preventDefault()

    onNoteCreated(content)

    setContent('')
    setShouldShowOnBoarding(true)

    toast.success('Nota criada com sucesso!')
  }

  function handleStartRecording() {
    const isSpeechRecognitionAPIAvailable = 'SpeechRecognition' in window
      || 'webkitSpeechRecognition' in window

      if (!isSpeechRecognitionAPIAvailable) {
        alert('Infelizmente seu navegador não suporta a API de gravação!')
        return
      }

      setIsRecording(true)
      setShouldShowOnBoarding(false)

      const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition

      speechRecognition = new SpeechRecognitionAPI()

      speechRecognition.lang = 'pt-BR'
      speechRecognition.continuous = true
      speechRecognition.maxAlternatives = 1
      speechRecognition.interimResults = true

      speechRecognition.onresult = event => {
        const transcription = Array.from(event.results).reduce((text, result) => {
          return text.concat(result[0].transcript)
        }, '')

        setContent(transcription)
      }

      speechRecognition.onerror = (event) => {
        console.error(event)
      }

      speechRecognition.start()
  }

  function handleStopRecording() {
    setIsRecording(false)

    if (speechRecognition !== null) {
      speechRecognition.stop()
    }
  }

  return (
    <Dialog.Root>
      <Dialog.Trigger
        className='
        rounded-md flex flex-col text-left 
        bg-slate-700 p-5 space-y-3
        hover:ring-2 hover:ring-slate-600 
        focus-visible:ring-2 focus-visible:ring-lime-400 
        outline-none
        '
      >
        <span className='text-sm font-medium text-slate-200'>Adicionar nota</span>

        <p className='text-sm leading-6 text-slate-400'>
          Grave uma nota em áudio que será convertida para texto automaticamente.
        </p>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className='inset-0 fixed bg-black/50' />

        <Dialog.Content className='fixed overflow-hidden inset-0 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:max-w-[640px] w-full md:h-[60vh] bg-slate-700 md:rounded-md flex flex-col outline-none'>
          <Dialog.Close className='absolute right-0 top-0 bg-slate-800 text-slate-400 hover:text-slate-100 p-1.5'>
            <X className='size-5' />
          </Dialog.Close>

          <form onSubmit={handleSaveNote} className='flex flex-1 flex-col'>
            <div className='flex flex-1 flex-col gap-3 p-5'>
              <span className='text-sm font-medium text-slate-300'>Adicionar nota</span>

              {shouldShowOnBoard ? (
                <p className='text-sm leading-6 text-slate-400'>
                  Comece{' '}
                  <button
                    onClick={handleStartRecording}
                    type='button'
                    className='font-medium text-lime-400 hover:underline'
                  >
                    gravando uma nota
                  </button>{' '}
                  em áudio ou se preferir{' '}
                  <button
                    type='button'
                    onClick={handleStartEditor}
                    className='font-medium text-lime-400 hover:underline'
                  >
                    utilize apenas texto
                  </button>
                </p>
              ) : (
                <textarea
                  autoFocus
                  className='text-sm leading-6 text-slate-400 bg-transparent resize-none flex-1 outline-none'
                  onChange={handleContentChanged}
                  value={content}
                />
              )}
            </div>

            {isRecording ? (
              <button
                type='button'
                onClick={handleStopRecording}
                className='w-full flex items-center justify-center gap-2 bg-sllate-900 py-4 text-center text-sm text-slate-300 outline-none font-medium hover:bg-slate-100'
              >
                <div className='size-3 rounded-full bg-red-500 animate-pulse' />
                Gravando! (clique p/ interromper)
              </button>
            ) : (
              <button
                type='submit'
                className='w-full bg-lime-400 py-4 text-center text-sm text-lime-950 outline-none font-medium hover:bg-lime-500'
              >
                Salvar nota
              </button>
            )}
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
