// Importa os módulos necessários do Electron
const { contextBridge, ipcRenderer } = require("electron");

// Expondo a API para o mundo do navegador
contextBridge.exposeInMainWorld("electronAPI", {
   executarConsultaSQL: (sqlQuery) =>
      ipcRenderer.invoke("executar_consulta_sql", sqlQuery),
   login: (email, senha) => ipcRenderer.invoke("login", email, senha),
   register: (nome, cargo, setor, segmento, email, senha) =>
      ipcRenderer.invoke(
         "register",
         nome,
         cargo,
         setor,
         segmento,
         email,
         senha
      ),
   obterDadosUsuario: (id_usuario) =>
      ipcRenderer.invoke("obter_dados_usuario", id_usuario),
   atualizarDadosUsuario: (
      id_usuario,
      nome,
      cargo,
      setor,
      segmento,
      email,
      senha,
      foto
   ) =>
      ipcRenderer.invoke(
         "atualizar_dados_usuario",
         id_usuario,
         nome,
         cargo,
         setor,
         segmento,
         email,
         senha,
         foto
      ),
   obterTarefasUsuario: (id_usuario) =>
      ipcRenderer.invoke("obter_tarefas_usuario", id_usuario),
   obterTarefasUsuarioDiaAtual: (id_usuario) =>
      ipcRenderer.invoke("obter_tarefas_usuario_dia_atual", id_usuario),
   obterTarefasEquipe: (id_usuario) =>
      ipcRenderer.invoke("obter_tarefas_equipe", id_usuario),
   obterTarefasEquipeDiaAtual: (id_usuario) =>
      ipcRenderer.invoke("obter_tarefas_equipe_dia_atual", id_usuario),
   obterTarefasAuxiliaresEquipe: (id_usuario) =>
      ipcRenderer.invoke("obter_tarefas_auxiliares_equipe", id_usuario),
   obterTarefasAnalistasEquipe: (id_usuario) =>
      ipcRenderer.invoke("obter_tarefas_analistas_equipe", id_usuario),
   obterTarefasSetor: (id_usuario) =>
      ipcRenderer.invoke("obter_tarefas_setor", id_usuario),
   obterTarefasSetorDiaAtual: (id_usuario) =>
      ipcRenderer.invoke("obter_tarefas_setor_dia_atual", id_usuario),
   verificarTarefasAtrasadas: (id_usuario) =>
      ipcRenderer.invoke("verificar_tarefas_atrasadas", id_usuario),
   registrarAlteracaoTarefa: (id_tarefa, status_novo) =>
      ipcRenderer.invoke("registrar_alteracao_status", id_tarefa, status_novo),
});
