/* eslint-disable @typescript-eslint/no-explicit-any */

export const openApiSpec = {
  openapi: "3.0.0",
  info: {
    title: "Atestado Escolar API",
    version: "1.0.0",
    description:
      "API do Sistema de Atestado Escolar. Autentique-se com `X-Api-Key: <sua_chave>` ou `Authorization: Bearer <jwt>`.",
  },
  servers: [{ url: "/api", description: "Servidor local" }],
  components: {
    securitySchemes: {
      ApiKey: { type: "apiKey", in: "header", name: "X-Api-Key" },
      BearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" },
    },
    schemas: {
      Usuario: {
        type: "object",
        properties: {
          id: { type: "integer" },
          nome: { type: "string" },
          email: { type: "string", format: "email" },
          perfil: { type: "string", enum: ["ALUNO","RESPONSAVEL","SECRETARIA","COORDENACAO","DIRECAO","ADMIN"] },
          matricula: { type: "string", nullable: true },
          cpf: { type: "string", nullable: true },
          ramal: { type: "string", nullable: true },
          departamento: { type: "string", nullable: true },
          codigoDiretoria: { type: "string", nullable: true },
          createdAt: { type: "string", format: "date-time" },
        },
      },
      Atestado: {
        type: "object",
        properties: {
          id: { type: "integer" },
          dataEmissao: { type: "string", format: "date-time" },
          periodo: { type: "string", example: "10/03/2024 a 12/03/2024" },
          motivo: { type: "string" },
          arquivoAnexo: { type: "string", nullable: true },
          status: { type: "string", enum: ["RECEBIDO","EM_ANALISE","APROVADO","RECUSADO"] },
          justificativaRecusa: { type: "string", nullable: true },
          usuarioId: { type: "integer" },
        },
      },
      Turma: {
        type: "object",
        properties: {
          id: { type: "integer" },
          codigoTurma: { type: "string" },
          curso: { $ref: "#/components/schemas/Curso" },
          disciplina: { $ref: "#/components/schemas/Disciplina" },
          alunos: { type: "array", items: { type: "object" } },
        },
      },
      Curso: {
        type: "object",
        properties: { id: { type: "integer" }, nome: { type: "string" } },
      },
      Disciplina: {
        type: "object",
        properties: {
          id: { type: "integer" },
          nome: { type: "string" },
          cargaHoraria: { type: "integer" },
        },
      },
      Notificacao: {
        type: "object",
        properties: {
          id: { type: "integer" },
          mensagem: { type: "string" },
          dataEnvio: { type: "string", format: "date-time" },
          tipoStatus: { type: "string" },
          lida: { type: "boolean" },
          usuarioId: { type: "integer" },
        },
      },
      Relatorio: {
        type: "object",
        properties: {
          id: { type: "integer" },
          tipoRelatorio: { type: "string" },
          dataGeracao: { type: "string", format: "date-time" },
          parametrosFiltro: { type: "string", nullable: true },
          resultado: { type: "object", nullable: true },
        },
      },
      Cronograma: {
        type: "object",
        properties: {
          id: { type: "integer" },
          anoLetivo: { type: "integer" },
          dataInicioSemestre: { type: "string", format: "date-time" },
          dataFimSemestre: { type: "string", format: "date-time" },
          periodosAvaliacao: { type: "string" },
        },
      },
      Error: {
        type: "object",
        properties: { error: { type: "string" } },
      },
    },
  },
  paths: {
    "/auth/login": {
      post: {
        summary: "Login — obtém JWT",
        operationId: "login",
        tags: ["Auth"],
        "x-scopes": [] as string[],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "senha"],
                properties: {
                  email: { type: "string", format: "email", example: "admin@escola.edu.br" },
                  senha: { type: "string", example: "Admin@123" },
                },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Token JWT retornado",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    token: { type: "string" },
                    usuario: { $ref: "#/components/schemas/Usuario" },
                  },
                },
              },
            },
          },
          "401": { description: "Credenciais inválidas" },
        },
      },
    },
    "/usuarios": {
      get: {
        summary: "Listar usuários",
        operationId: "listUsuarios",
        tags: ["Usuários"],
        "x-scopes": ["usuarios:read"],
        security: [{ ApiKey: [] }, { BearerAuth: [] }],
        responses: {
          "200": { description: "Lista de usuários", content: { "application/json": { schema: { type: "array", items: { $ref: "#/components/schemas/Usuario" } } } } },
        },
      },
      post: {
        summary: "Criar usuário",
        operationId: "createUsuario",
        tags: ["Usuários"],
        "x-scopes": ["usuarios:write"],
        security: [{ ApiKey: [] }, { BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["nome", "email", "senha"],
                properties: {
                  nome: { type: "string" },
                  email: { type: "string", format: "email" },
                  senha: { type: "string", minLength: 6 },
                  perfil: { type: "string", enum: ["ALUNO","RESPONSAVEL","SECRETARIA","COORDENACAO","DIRECAO","ADMIN"] },
                  matricula: { type: "string" },
                  cpf: { type: "string" },
                },
              },
            },
          },
        },
        responses: {
          "201": { description: "Usuário criado", content: { "application/json": { schema: { $ref: "#/components/schemas/Usuario" } } } },
          "409": { description: "E-mail/matrícula já cadastrado" },
          "422": { description: "Dados inválidos" },
        },
      },
    },
    "/usuarios/{id}": {
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
      get: {
        summary: "Buscar usuário por ID",
        operationId: "getUsuario",
        tags: ["Usuários"],
        "x-scopes": ["usuarios:read"],
        security: [{ ApiKey: [] }, { BearerAuth: [] }],
        responses: {
          "200": { description: "Usuário", content: { "application/json": { schema: { $ref: "#/components/schemas/Usuario" } } } },
          "404": { description: "Não encontrado" },
        },
      },
      put: {
        summary: "Atualizar usuário",
        operationId: "updateUsuario",
        tags: ["Usuários"],
        "x-scopes": ["usuarios:write"],
        security: [{ ApiKey: [] }, { BearerAuth: [] }],
        requestBody: { required: true, content: { "application/json": { schema: { type: "object", properties: { nome: { type: "string" }, email: { type: "string" } } } } } },
        responses: { "200": { description: "Atualizado" }, "404": { description: "Não encontrado" } },
      },
      delete: {
        summary: "Remover usuário",
        operationId: "deleteUsuario",
        tags: ["Usuários"],
        "x-scopes": ["usuarios:delete"],
        security: [{ ApiKey: [] }, { BearerAuth: [] }],
        responses: { "204": { description: "Removido" }, "404": { description: "Não encontrado" } },
      },
    },
    "/atestados": {
      get: {
        summary: "Listar atestados",
        operationId: "listAtestados",
        tags: ["Atestados"],
        "x-scopes": ["atestados:read"],
        security: [{ ApiKey: [] }, { BearerAuth: [] }],
        parameters: [
          { name: "status", in: "query", schema: { type: "string", enum: ["RECEBIDO","EM_ANALISE","APROVADO","RECUSADO"] } },
          { name: "usuarioId", in: "query", schema: { type: "integer" } },
        ],
        responses: { "200": { description: "Lista de atestados", content: { "application/json": { schema: { type: "array", items: { $ref: "#/components/schemas/Atestado" } } } } } },
      },
      post: {
        summary: "Enviar atestado",
        operationId: "createAtestado",
        tags: ["Atestados"],
        "x-scopes": ["atestados:write"],
        security: [{ ApiKey: [] }, { BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["usuarioId", "periodo", "motivo"],
                properties: {
                  usuarioId: { type: "integer" },
                  periodo: { type: "string", example: "10/03/2024 a 12/03/2024" },
                  motivo: { type: "string" },
                  arquivoAnexo: { type: "string", format: "uri" },
                  cronogramaId: { type: "integer" },
                },
              },
            },
          },
        },
        responses: { "201": { description: "Criado", content: { "application/json": { schema: { $ref: "#/components/schemas/Atestado" } } } }, "422": { description: "Dados inválidos" } },
      },
    },
    "/atestados/{id}": {
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
      get: {
        summary: "Buscar atestado por ID",
        operationId: "getAtestado",
        tags: ["Atestados"],
        "x-scopes": ["atestados:read"],
        security: [{ ApiKey: [] }, { BearerAuth: [] }],
        responses: { "200": { description: "Atestado", content: { "application/json": { schema: { $ref: "#/components/schemas/Atestado" } } } }, "404": { description: "Não encontrado" } },
      },
      delete: {
        summary: "Remover atestado",
        operationId: "deleteAtestado",
        tags: ["Atestados"],
        "x-scopes": ["atestados:delete"],
        security: [{ ApiKey: [] }, { BearerAuth: [] }],
        responses: { "204": { description: "Removido" }, "404": { description: "Não encontrado" } },
      },
    },
    "/atestados/{id}/status": {
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
      patch: {
        summary: "Atualizar status do atestado",
        operationId: "updateAtestadoStatus",
        tags: ["Atestados"],
        "x-scopes": ["atestados:write"],
        security: [{ ApiKey: [] }, { BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["status"],
                properties: {
                  status: { type: "string", enum: ["RECEBIDO","EM_ANALISE","APROVADO","RECUSADO"] },
                  justificativaRecusa: { type: "string" },
                },
              },
            },
          },
        },
        responses: { "200": { description: "Status atualizado + notificação enviada" }, "404": { description: "Não encontrado" } },
      },
    },
    "/turmas": {
      get: {
        summary: "Listar turmas",
        operationId: "listTurmas",
        tags: ["Turmas"],
        "x-scopes": ["turmas:read"],
        security: [{ ApiKey: [] }, { BearerAuth: [] }],
        responses: { "200": { description: "Lista de turmas", content: { "application/json": { schema: { type: "array", items: { $ref: "#/components/schemas/Turma" } } } } } },
      },
      post: {
        summary: "Criar turma",
        operationId: "createTurma",
        tags: ["Turmas"],
        "x-scopes": ["turmas:write"],
        security: [{ ApiKey: [] }, { BearerAuth: [] }],
        requestBody: { required: true, content: { "application/json": { schema: { type: "object", required: ["codigoTurma","cursoId","disciplinaId"], properties: { codigoTurma: { type: "string" }, cursoId: { type: "integer" }, disciplinaId: { type: "integer" } } } } } },
        responses: { "201": { description: "Criada" }, "409": { description: "Código já existe" } },
      },
    },
    "/turmas/{id}": {
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
      get: {
        summary: "Buscar turma por ID",
        operationId: "getTurma",
        tags: ["Turmas"],
        "x-scopes": ["turmas:read"],
        security: [{ ApiKey: [] }, { BearerAuth: [] }],
        responses: { "200": { description: "Turma", content: { "application/json": { schema: { $ref: "#/components/schemas/Turma" } } } }, "404": { description: "Não encontrado" } },
      },
      patch: {
        summary: "Vincular/desvincular alunos",
        operationId: "updateTurma",
        tags: ["Turmas"],
        "x-scopes": ["turmas:write"],
        security: [{ ApiKey: [] }, { BearerAuth: [] }],
        requestBody: { required: true, content: { "application/json": { schema: { type: "object", properties: { conectar: { type: "array", items: { type: "integer" } }, desconectar: { type: "array", items: { type: "integer" } } } } } } },
        responses: { "200": { description: "Turma atualizada" } },
      },
      delete: {
        summary: "Remover turma",
        operationId: "deleteTurma",
        tags: ["Turmas"],
        "x-scopes": ["turmas:delete"],
        security: [{ ApiKey: [] }, { BearerAuth: [] }],
        responses: { "204": { description: "Removida" }, "404": { description: "Não encontrado" } },
      },
    },
    "/notificacoes": {
      get: {
        summary: "Listar notificações",
        operationId: "listNotificacoes",
        tags: ["Notificações"],
        "x-scopes": ["notificacoes:read"],
        security: [{ ApiKey: [] }, { BearerAuth: [] }],
        parameters: [
          { name: "usuarioId", in: "query", schema: { type: "integer" } },
          { name: "naoLidas", in: "query", schema: { type: "boolean" } },
        ],
        responses: { "200": { description: "Lista de notificações", content: { "application/json": { schema: { type: "array", items: { $ref: "#/components/schemas/Notificacao" } } } } } },
      },
    },
    "/notificacoes/{id}": {
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
      patch: {
        summary: "Marcar notificação como lida",
        operationId: "markNotificacaoLida",
        tags: ["Notificações"],
        "x-scopes": ["notificacoes:write"],
        security: [{ ApiKey: [] }, { BearerAuth: [] }],
        responses: { "200": { description: "Marcada como lida" }, "404": { description: "Não encontrada" } },
      },
    },
    "/cronograma": {
      get: {
        summary: "Listar cronogramas",
        operationId: "listCronogramas",
        tags: ["Cronograma"],
        "x-scopes": ["cronograma:read"],
        security: [{ ApiKey: [] }, { BearerAuth: [] }],
        responses: { "200": { description: "Lista de cronogramas", content: { "application/json": { schema: { type: "array", items: { $ref: "#/components/schemas/Cronograma" } } } } } },
      },
      post: {
        summary: "Criar cronograma",
        operationId: "createCronograma",
        tags: ["Cronograma"],
        "x-scopes": ["cronograma:write"],
        security: [{ ApiKey: [] }, { BearerAuth: [] }],
        requestBody: { required: true, content: { "application/json": { schema: { type: "object", required: ["anoLetivo","dataInicioSemestre","dataFimSemestre","periodosAvaliacao"], properties: { anoLetivo: { type: "integer" }, dataInicioSemestre: { type: "string", format: "date" }, dataFimSemestre: { type: "string", format: "date" }, periodosAvaliacao: { type: "string" } } } } } },
        responses: { "201": { description: "Criado" } },
      },
    },
    "/relatorios": {
      get: {
        summary: "Listar relatórios gerados",
        operationId: "listRelatorios",
        tags: ["Relatórios"],
        "x-scopes": ["relatorios:read"],
        security: [{ ApiKey: [] }, { BearerAuth: [] }],
        responses: { "200": { description: "Lista de relatórios", content: { "application/json": { schema: { type: "array", items: { $ref: "#/components/schemas/Relatorio" } } } } } },
      },
      post: {
        summary: "Gerar relatório",
        operationId: "generateRelatorio",
        tags: ["Relatórios"],
        "x-scopes": ["relatorios:read"],
        security: [{ ApiKey: [] }, { BearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["tipo"],
                properties: {
                  tipo: { type: "string", enum: ["atestados_por_periodo","faltas_por_aluno"] },
                  dataInicio: { type: "string", format: "date" },
                  dataFim: { type: "string", format: "date" },
                  usuarioId: { type: "integer" },
                },
              },
            },
          },
        },
        responses: { "201": { description: "Relatório gerado" } },
      },
    },
    "/cursos": {
      get: {
        summary: "Listar cursos",
        operationId: "listCursos",
        tags: ["Cursos"],
        "x-scopes": ["cursos:read"],
        security: [{ ApiKey: [] }, { BearerAuth: [] }],
        responses: { "200": { description: "Cursos" } },
      },
      post: {
        summary: "Criar curso",
        operationId: "createCurso",
        tags: ["Cursos"],
        "x-scopes": ["cursos:write"],
        security: [{ ApiKey: [] }, { BearerAuth: [] }],
        requestBody: { required: true, content: { "application/json": { schema: { type: "object", required: ["nome"], properties: { nome: { type: "string" } } } } } },
        responses: { "201": { description: "Criado" } },
      },
    },
    "/disciplinas": {
      get: {
        summary: "Listar disciplinas",
        operationId: "listDisciplinas",
        tags: ["Disciplinas"],
        "x-scopes": ["disciplinas:read"],
        security: [{ ApiKey: [] }, { BearerAuth: [] }],
        responses: { "200": { description: "Disciplinas" } },
      },
      post: {
        summary: "Criar disciplina",
        operationId: "createDisciplina",
        tags: ["Disciplinas"],
        "x-scopes": ["disciplinas:write"],
        security: [{ ApiKey: [] }, { BearerAuth: [] }],
        requestBody: { required: true, content: { "application/json": { schema: { type: "object", required: ["nome","cargaHoraria"], properties: { nome: { type: "string" }, cargaHoraria: { type: "integer" } } } } } },
        responses: { "201": { description: "Criada" } },
      },
    },
  },
};

/** Filtra o spec para incluir apenas operações cobertas pelos escopos fornecidos. */
export function filterSpecByScopes(scopes: string[]): typeof openApiSpec {
  if (scopes.includes("*")) return openApiSpec;

  const filteredPaths: Record<string, any> = {};

  for (const [path, pathItem] of Object.entries(openApiSpec.paths)) {
    const filteredMethods: Record<string, any> = {};

    // Parâmetros de nível de path (compartilhados por todos os métodos)
    if ("parameters" in pathItem) {
      filteredMethods.parameters = (pathItem as any).parameters;
    }

    for (const [method, operation] of Object.entries(pathItem)) {
      if (method === "parameters") continue;
      const op = operation as any;
      const required: string[] = op["x-scopes"] ?? [];

      // Inclui se não exige escopo (público) ou se algum escopo da key cobre
      if (required.length === 0 || required.some((s: string) => scopes.includes(s))) {
        filteredMethods[method] = op;
      }
    }

    // Só inclui o path se tiver ao menos um método (além de parameters)
    const methods = Object.keys(filteredMethods).filter((k) => k !== "parameters");
    if (methods.length > 0) {
      filteredPaths[path] = filteredMethods;
    }
  }

  return { ...openApiSpec, paths: filteredPaths as typeof openApiSpec.paths };
}
