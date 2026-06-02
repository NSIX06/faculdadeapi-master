import "dotenv/config";
import { PrismaClient, PerfilUsuario, StatusAtestado } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import bcrypt from "bcryptjs";
import { randomBytes, createHash } from "crypto";

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter } as ConstructorParameters<typeof PrismaClient>[0]);

// ── helpers ────────────────────────────────────────────────────────────────────

const hash = (s: string) => bcrypt.hashSync(s, 12);

function makeApiKey(prefix: string) {
  const raw = randomBytes(32).toString("hex");
  const fullKey = `sk_${raw.slice(0, 8)}_${raw.slice(8)}`;
  const keyHash = createHash("sha256").update(fullKey).digest("hex");
  return { fullKey, prefix: `sk_${raw.slice(0, 8)}`, keyHash };
}

// ── seed ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log("🌱  Iniciando seed...\n");

  // ── 1. Usuários ─────────────────────────────────────────────────────────────

  const admin = await prisma.usuario.upsert({
    where: { email: "admin@escola.edu.br" },
    update: {},
    create: {
      nome: "Admin Sistema",
      email: "admin@escola.edu.br",
      senhaHash: hash("Admin@123"),
      perfil: PerfilUsuario.ADMIN,
    },
  });

  const direcao = await prisma.usuario.upsert({
    where: { email: "direcao@escola.edu.br" },
    update: {},
    create: {
      nome: "Marcia Oliveira",
      email: "direcao@escola.edu.br",
      senhaHash: hash("Direcao@123"),
      perfil: PerfilUsuario.DIRECAO,
      codigoDiretoria: "DIR-001",
    },
  });

  const coordenacao = await prisma.usuario.upsert({
    where: { email: "coordenacao@escola.edu.br" },
    update: {},
    create: {
      nome: "Roberto Alves",
      email: "coordenacao@escola.edu.br",
      senhaHash: hash("Coord@123"),
      perfil: PerfilUsuario.COORDENACAO,
      departamento: "Tecnologia da Informação",
    },
  });

  const secretaria = await prisma.usuario.upsert({
    where: { email: "secretaria@escola.edu.br" },
    update: {},
    create: {
      nome: "Fernanda Santos",
      email: "secretaria@escola.edu.br",
      senhaHash: hash("Sec@123"),
      perfil: PerfilUsuario.SECRETARIA,
      ramal: "2201",
    },
  });

  const alunos = await Promise.all([
    prisma.usuario.upsert({
      where: { email: "joao.silva@aluno.escola.edu.br" },
      update: {},
      create: {
        nome: "João da Silva",
        email: "joao.silva@aluno.escola.edu.br",
        senhaHash: hash("Aluno@123"),
        perfil: PerfilUsuario.ALUNO,
        matricula: "2024001",
      },
    }),
    prisma.usuario.upsert({
      where: { email: "maria.souza@aluno.escola.edu.br" },
      update: {},
      create: {
        nome: "Maria Souza",
        email: "maria.souza@aluno.escola.edu.br",
        senhaHash: hash("Aluno@123"),
        perfil: PerfilUsuario.ALUNO,
        matricula: "2024002",
      },
    }),
    prisma.usuario.upsert({
      where: { email: "pedro.costa@aluno.escola.edu.br" },
      update: {},
      create: {
        nome: "Pedro Costa",
        email: "pedro.costa@aluno.escola.edu.br",
        senhaHash: hash("Aluno@123"),
        perfil: PerfilUsuario.ALUNO,
        matricula: "2024003",
      },
    }),
    prisma.usuario.upsert({
      where: { email: "ana.lima@aluno.escola.edu.br" },
      update: {},
      create: {
        nome: "Ana Lima",
        email: "ana.lima@aluno.escola.edu.br",
        senhaHash: hash("Aluno@123"),
        perfil: PerfilUsuario.ALUNO,
        matricula: "2024004",
      },
    }),
    prisma.usuario.upsert({
      where: { email: "lucas.ferreira@aluno.escola.edu.br" },
      update: {},
      create: {
        nome: "Lucas Ferreira",
        email: "lucas.ferreira@aluno.escola.edu.br",
        senhaHash: hash("Aluno@123"),
        perfil: PerfilUsuario.ALUNO,
        matricula: "2024005",
      },
    }),
  ]);

  const responsaveis = await Promise.all([
    prisma.usuario.upsert({
      where: { email: "resp.joao@gmail.com" },
      update: {},
      create: {
        nome: "Carlos da Silva (pai de João)",
        email: "resp.joao@gmail.com",
        senhaHash: hash("Resp@123"),
        perfil: PerfilUsuario.RESPONSAVEL,
        cpf: "111.222.333-44",
      },
    }),
    prisma.usuario.upsert({
      where: { email: "resp.maria@gmail.com" },
      update: {},
      create: {
        nome: "Sandra Souza (mãe de Maria)",
        email: "resp.maria@gmail.com",
        senhaHash: hash("Resp@123"),
        perfil: PerfilUsuario.RESPONSAVEL,
        cpf: "555.666.777-88",
      },
    }),
  ]);

  console.log(`✅  Usuários: ${2 + 2 + alunos.length + responsaveis.length} criados`);

  // ── 2. Cursos e Disciplinas ──────────────────────────────────────────────────

  const [cursoTI, cursoAdm, cursoContab] = await Promise.all([
    prisma.curso.upsert({ where: { nome: "Análise e Desenvolvimento de Sistemas" }, update: {}, create: { nome: "Análise e Desenvolvimento de Sistemas" } }),
    prisma.curso.upsert({ where: { nome: "Administração" }, update: {}, create: { nome: "Administração" } }),
    prisma.curso.upsert({ where: { nome: "Contabilidade" }, update: {}, create: { nome: "Contabilidade" } }),
  ]);

  const [discPOO, discBD, discRedes, discCalculo, discGestao] = await Promise.all([
    prisma.disciplina.upsert({ where: { nome: "Programação Orientada a Objetos" }, update: {}, create: { nome: "Programação Orientada a Objetos", cargaHoraria: 80 } }),
    prisma.disciplina.upsert({ where: { nome: "Banco de Dados" }, update: {}, create: { nome: "Banco de Dados", cargaHoraria: 60 } }),
    prisma.disciplina.upsert({ where: { nome: "Redes de Computadores" }, update: {}, create: { nome: "Redes de Computadores", cargaHoraria: 60 } }),
    prisma.disciplina.upsert({ where: { nome: "Cálculo Diferencial e Integral" }, update: {}, create: { nome: "Cálculo Diferencial e Integral", cargaHoraria: 80 } }),
    prisma.disciplina.upsert({ where: { nome: "Gestão de Projetos" }, update: {}, create: { nome: "Gestão de Projetos", cargaHoraria: 40 } }),
  ]);

  console.log("✅  Cursos e disciplinas criados");

  // ── 3. Turmas ────────────────────────────────────────────────────────────────

  const turmaADS1 = await prisma.turma.upsert({
    where: { codigoTurma: "ADS-2024-1" },
    update: {},
    create: {
      codigoTurma: "ADS-2024-1",
      cursoId: cursoTI.id,
      disciplinaId: discPOO.id,
      alunos: { connect: [alunos[0], alunos[1], alunos[2]].map((a) => ({ id: a.id })) },
    },
  });

  const turmaADS2 = await prisma.turma.upsert({
    where: { codigoTurma: "ADS-2024-2" },
    update: {},
    create: {
      codigoTurma: "ADS-2024-2",
      cursoId: cursoTI.id,
      disciplinaId: discBD.id,
      alunos: { connect: [alunos[1], alunos[3], alunos[4]].map((a) => ({ id: a.id })) },
    },
  });

  const turmaAdm = await prisma.turma.upsert({
    where: { codigoTurma: "ADM-2024-1" },
    update: {},
    create: {
      codigoTurma: "ADM-2024-1",
      cursoId: cursoAdm.id,
      disciplinaId: discGestao.id,
      alunos: { connect: [alunos[3], alunos[4]].map((a) => ({ id: a.id })) },
    },
  });

  console.log("✅  Turmas criadas e alunos vinculados");

  // ── 4. Cronograma ────────────────────────────────────────────────────────────

  const cronograma = await prisma.cronograma.upsert({
    where: { id: 1 },
    update: {},
    create: {
      anoLetivo: 2024,
      dataInicioSemestre: new Date("2024-02-05"),
      dataFimSemestre: new Date("2024-06-28"),
      periodosAvaliacao: "P1: 18/03-29/03 | P2: 27/05-07/06 | Recuperação: 24/06-28/06",
    },
  });

  console.log("✅  Cronograma criado");

  // ── 5. Atestados ─────────────────────────────────────────────────────────────

  const atestados = await Promise.all([
    // João — aprovado
    prisma.atestado.create({
      data: {
        usuarioId: alunos[0].id,
        periodo: "10/03/2024 a 12/03/2024",
        motivo: "Gripe com febre — atestado médico do Dr. Paulo Mendes (CRM 12345)",
        status: StatusAtestado.APROVADO,
        cronogramaId: cronograma.id,
      },
    }),
    // Maria — em análise
    prisma.atestado.create({
      data: {
        usuarioId: alunos[1].id,
        periodo: "05/04/2024 a 07/04/2024",
        motivo: "Consulta odontológica de emergência",
        status: StatusAtestado.EM_ANALISE,
        cronogramaId: cronograma.id,
      },
    }),
    // Pedro — recusado
    prisma.atestado.create({
      data: {
        usuarioId: alunos[2].id,
        periodo: "15/03/2024",
        motivo: "Não comparecimento sem justificativa médica",
        status: StatusAtestado.RECUSADO,
        justificativaRecusa: "Documento apresentado está ilegível e sem CRM do médico responsável.",
        cronogramaId: cronograma.id,
      },
    }),
    // Ana — recebido
    prisma.atestado.create({
      data: {
        usuarioId: alunos[3].id,
        periodo: "22/04/2024 a 24/04/2024",
        motivo: "Internação hospitalar — apendicite",
        status: StatusAtestado.RECEBIDO,
        cronogramaId: cronograma.id,
      },
    }),
    // Lucas — aprovado
    prisma.atestado.create({
      data: {
        usuarioId: alunos[4].id,
        periodo: "08/05/2024",
        motivo: "Consulta médica de rotina — pré-agendada",
        status: StatusAtestado.APROVADO,
        cronogramaId: cronograma.id,
      },
    }),
  ]);

  console.log(`✅  Atestados: ${atestados.length} criados`);

  // ── 6. Notificações ──────────────────────────────────────────────────────────

  await Promise.all([
    prisma.notificacao.create({
      data: {
        usuarioId: alunos[0].id,
        atestadoId: atestados[0].id,
        mensagem: "Seu atestado referente ao período 10/03–12/03 foi APROVADO.",
        tipoStatus: StatusAtestado.APROVADO,
        lida: true,
      },
    }),
    prisma.notificacao.create({
      data: {
        usuarioId: alunos[1].id,
        atestadoId: atestados[1].id,
        mensagem: "Seu atestado está em análise. Aguarde o retorno da secretaria.",
        tipoStatus: StatusAtestado.EM_ANALISE,
        lida: false,
      },
    }),
    prisma.notificacao.create({
      data: {
        usuarioId: alunos[2].id,
        atestadoId: atestados[2].id,
        mensagem: "Seu atestado foi RECUSADO. Motivo: documento ilegível sem CRM.",
        tipoStatus: StatusAtestado.RECUSADO,
        lida: false,
      },
    }),
    prisma.notificacao.create({
      data: {
        usuarioId: alunos[3].id,
        atestadoId: atestados[3].id,
        mensagem: "Atestado recebido com sucesso! Em breve será analisado.",
        tipoStatus: StatusAtestado.RECEBIDO,
        lida: false,
      },
    }),
    prisma.notificacao.create({
      data: {
        usuarioId: alunos[4].id,
        atestadoId: atestados[4].id,
        mensagem: "Seu atestado referente ao dia 08/05 foi APROVADO.",
        tipoStatus: StatusAtestado.APROVADO,
        lida: true,
      },
    }),
  ]);

  console.log("✅  Notificações criadas");

  // ── 7. Relatório de exemplo ───────────────────────────────────────────────────

  await prisma.relatorio.create({
    data: {
      tipoRelatorio: "atestados_por_periodo",
      parametrosFiltro: JSON.stringify({ dataInicio: "2024-01-01", dataFim: "2024-06-30" }),
      resultado: {
        APROVADO: 2,
        EM_ANALISE: 1,
        RECUSADO: 1,
        RECEBIDO: 1,
      },
    },
  });

  console.log("✅  Relatório de exemplo criado");

  // ── 8. API Keys ───────────────────────────────────────────────────────────────

  const keyAdmin = makeApiKey("admin");
  const keyFront = makeApiKey("front");
  const keySecretaria = makeApiKey("sec");

  const [k1, k2, k3] = await Promise.all([
    prisma.apiKey.create({
      data: {
        name: "Admin — Acesso Total",
        prefix: keyAdmin.prefix,
        keyHash: keyAdmin.keyHash,
        scopes: ["*"],
        createdById: admin.id,
      },
    }),
    prisma.apiKey.create({
      data: {
        name: "Front-end React — Leitura Geral",
        prefix: keyFront.prefix,
        keyHash: keyFront.keyHash,
        scopes: [
          "usuarios:read",
          "atestados:read",
          "turmas:read",
          "notificacoes:read",
          "cursos:read",
          "disciplinas:read",
          "cronograma:read",
          "relatorios:read",
        ],
        createdById: admin.id,
      },
    }),
    prisma.apiKey.create({
      data: {
        name: "Secretaria — Gerenciar Atestados",
        prefix: keySecretaria.prefix,
        keyHash: keySecretaria.keyHash,
        scopes: [
          "atestados:read",
          "atestados:write",
          "notificacoes:read",
          "notificacoes:write",
          "usuarios:read",
        ],
        createdById: admin.id,
      },
    }),
  ]);

  console.log("✅  API Keys criadas\n");

  // ── resumo ────────────────────────────────────────────────────────────────────

  console.log("═══════════════════════════════════════════════════");
  console.log("  CREDENCIAIS DE ACESSO (só visíveis agora)");
  console.log("═══════════════════════════════════════════════════");
  console.log("\n🔑  Logins (email / senha):");
  console.log("  Admin:        admin@escola.edu.br   /  Admin@123");
  console.log("  Direção:      direcao@escola.edu.br /  Direcao@123");
  console.log("  Coordenação:  coordenacao@escola.edu.br / Coord@123");
  console.log("  Secretaria:   secretaria@escola.edu.br  / Sec@123");
  console.log("  Alunos:       joao.silva / maria.souza / pedro.costa");
  console.log("                ana.lima / lucas.ferreira @aluno.escola.edu.br / Aluno@123");

  console.log("\n🗝️   API Keys (guarde — não recuperáveis depois):");
  console.log(`  [${k1.name}]`);
  console.log(`  ${keyAdmin.fullKey}`);
  console.log(`\n  [${k2.name}]`);
  console.log(`  ${keyFront.fullKey}`);
  console.log(`\n  [${k3.name}]`);
  console.log(`  ${keySecretaria.fullKey}`);
  console.log("\n═══════════════════════════════════════════════════");
  console.log("✨  Seed concluído com sucesso!\n");
}

main()
  .catch((e) => {
    console.error("❌  Erro no seed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
