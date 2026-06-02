'use client'

import { X, FileText, Users, Bell, BookMarked, BarChart2, Calendar, GraduationCap, BookOpen, HelpCircle } from 'lucide-react'

interface HelpModalProps {
  open: boolean
  onClose: () => void
}

const sections = [
  {
    icon: FileText,
    title: 'Atestados',
    description: 'Crie, visualize e gerencie atestados acadêmicos. Use os filtros por status (Recebido, Em Análise, Aprovado, Recusado) e por aluno. Você pode anexar PDF ou imagem (até 2 MB).',
  },
  {
    icon: Users,
    title: 'Usuários',
    description: 'Gerencie todos os usuários do sistema: alunos, responsáveis, secretaria, coordenação, direção e admin. Use a busca por nome, e-mail ou matrícula.',
  },
  {
    icon: Bell,
    title: 'Notificações',
    description: 'Receba alertas automáticos a cada mudança de status de atestado. Filtre por não lidas ou marque todas como lidas de uma vez.',
  },
  {
    icon: BookMarked,
    title: 'Turmas',
    description: 'Crie turmas vinculando cursos e disciplinas. Adicione ou remova alunos de cada turma conforme necessário.',
  },
  {
    icon: Calendar,
    title: 'Cronograma',
    description: 'Registre o calendário letivo: ano, início e fim de semestre e períodos de avaliação. Os atestados podem ser vinculados a um cronograma.',
  },
  {
    icon: BarChart2,
    title: 'Relatórios',
    description: 'Gere relatórios consolidados de atestados por período ou de faltas por aluno. Defina o intervalo de datas e o tipo de relatório.',
  },
  {
    icon: GraduationCap,
    title: 'Cursos',
    description: 'Cadastre os cursos oferecidos pela instituição. Os cursos são vinculados às turmas.',
  },
  {
    icon: BookOpen,
    title: 'Disciplinas',
    description: 'Cadastre as disciplinas com nome e carga horária. As disciplinas são vinculadas às turmas.',
  },
]

const faqs = [
  {
    q: 'Como enviar um atestado com arquivo?',
    a: 'Clique em "+ Novo Atestado", preencha os dados e clique em "Selecionar arquivo". Aceita PDF ou imagem (JPG/PNG) até 2 MB. O arquivo é convertido para texto internamente.',
  },
  {
    q: 'Como aprovar ou recusar um atestado?',
    a: 'Abra os detalhes do atestado pelo botão "Detalhes", role até a seção de status e selecione a nova situação. Para recusar, é obrigatório informar uma justificativa.',
  },
  {
    q: 'Como o aluno recebe a resposta?',
    a: 'Uma notificação é gerada automaticamente a cada mudança de status e aparece na seção Notificações do aluno.',
  },
  {
    q: 'Esqueci a senha. O que faço?',
    a: 'Entre em contato com o administrador do sistema para redefinição de senha.',
  },
]

export function HelpModal({ open, onClose }: HelpModalProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl max-h-[90vh] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl flex flex-col animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-gray-100 dark:border-gray-800 flex-shrink-0">
          <div className="flex items-center gap-2">
            <HelpCircle size={20} className="text-brand-500" />
            <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">Central de Ajuda</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 dark:hover:text-gray-200 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto px-6 py-5 space-y-8">
          {/* Intro */}
          <div className="p-4 bg-brand-50 dark:bg-brand-950/50 rounded-xl border border-brand-100 dark:border-brand-900">
            <p className="text-sm text-brand-800 dark:text-brand-300 leading-relaxed">
              Bem-vindo ao <strong>Atestado Escolar</strong> — sistema para gestão de atestados acadêmicos.
              Use o menu lateral para navegar entre as seções. Abaixo você encontra um guia rápido de cada funcionalidade.
            </p>
          </div>

          {/* Sections */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">Funcionalidades</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {sections.map(({ icon: Icon, title, description }) => (
                <div key={title} className="flex gap-3 p-3 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                  <div className="w-8 h-8 bg-brand-100 dark:bg-brand-900/50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Icon size={15} className="text-brand-600 dark:text-brand-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{title}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed">{description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* FAQ */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">Perguntas frequentes</h3>
            <div className="space-y-3">
              {faqs.map(({ q, a }) => (
                <div key={q} className="p-3 rounded-xl border border-gray-100 dark:border-gray-800">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{q}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">{a}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Credentials */}
          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
            <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">Credenciais de acesso (ambiente de teste)</p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-gray-500 dark:text-gray-400">
              <span className="font-medium text-gray-700 dark:text-gray-300">Admin</span><span>admin@escola.edu.br · Admin@123</span>
              <span className="font-medium text-gray-700 dark:text-gray-300">Direção</span><span>direcao@escola.edu.br · Direcao@123</span>
              <span className="font-medium text-gray-700 dark:text-gray-300">Secretaria</span><span>secretaria@escola.edu.br · Sec@123</span>
              <span className="font-medium text-gray-700 dark:text-gray-300">Aluno</span><span>joao.silva@aluno.escola.edu.br · Aluno@123</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
