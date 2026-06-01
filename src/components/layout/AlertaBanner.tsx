import { AlertCircle, Clock } from 'lucide-react'
import type { Prospect } from '../../types'

interface AlertaBannerProps {
  prospects: Prospect[]
}

export default function AlertaBanner({ prospects }: AlertaBannerProps) {
  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)

  const atrasados = prospects.filter((p) => {
    if (p.status !== 'aberto') return false
    const retorno = new Date(p.proximo_retorno + 'T00:00:00')
    return retorno < hoje
  })

  const paraHoje = prospects.filter((p) => {
    if (p.status !== 'aberto') return false
    const retorno = new Date(p.proximo_retorno + 'T00:00:00')
    return retorno.getTime() === hoje.getTime()
  })

  if (atrasados.length === 0 && paraHoje.length === 0) return null

  return (
    <div className="max-w-2xl mx-auto px-4 pt-4 space-y-2">
      {atrasados.length > 0 && (
        <div className="bg-red-50 border border-red-100 rounded-2xl px-4 py-3 flex items-center gap-3">
          <AlertCircle size={18} className="text-red-500 shrink-0" />
          <p className="text-sm text-red-700 font-medium">
            {atrasados.length === 1
              ? '1 retorno atrasado — ligue agora!'
              : `${atrasados.length} retornos atrasados — ligue agora!`}
          </p>
        </div>
      )}

      {paraHoje.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-100 rounded-2xl px-4 py-3 flex items-center gap-3">
          <Clock size={18} className="text-yellow-600 shrink-0" />
          <p className="text-sm text-yellow-700 font-medium">
            {paraHoje.length === 1
              ? '1 retorno para hoje — não esqueça!'
              : `${paraHoje.length} retornos para hoje — não esqueça!`}
          </p>
        </div>
      )}
    </div>
  )
}
