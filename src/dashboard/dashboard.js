// Obtém userInfo do localStorage
const userInfoString = localStorage.getItem("userInfo");
// Transforma em objeto
const userInfo = JSON.parse(userInfoString);
console.log("userInfo:", userInfo);
console.log(userId);

// Função para atualizar as tarefas atrasadas
const atualizarTarefasAtrasadas = async () => {
   try {
      const resultado = await window.electronAPI.verificarTarefasAtrasadas(
         userId
      );
      console.log("resultado:", resultado);
   } catch (error) {
      console.error("Erro ao atualizar tarefas atrasadas:", error);
   }
};

// Chamada da função
atualizarTarefasAtrasadas();

// Inicialização da variável cargo
let dashboardCargo;

// Função para renderizar Dashboard
function createDashboard(dashboardType, data) {
   showLoadingModal();
   const dashboardContent = document.querySelector(".dashboard-container");
   dashboardContent.innerHTML = "";

   const welcomeContent = `
      <div class="card-content welcome-content">
         <div class="message welcome-message">
            <p>
               Bem-vindo,
                  <span id="user-name">${data.nome}</span>!
            </p>
            <p class="caption">
               Aqui você encontrará um painel personalizado 
               com informações detalhadas sobre
               seu desempenho e progresso.
            </p>
         </div>
         <img
            src="../images/welcome.gif"
            alt="Avatar do Usuário"
            class="avatar"
         />
      </div>
    `;

   const todayContent = `
      <div class="card-content today-content">
         <div class="message">
            <p>Visão geral do seu <span>Dia</span></p>
            <p class="caption">
               Resumo do dia.
            </p>
         </div>
         <canvas class="chart" id="todayChart"></canvas>
         <div class="no-chart-message" style="display:none;">
            <p>Não há tarefas para hoje.</p>
            <img src="../images/empty.gif" alt="Sem tarefas" />
         </div>
      </div>
    `;

   const monthContent = `
      <div class="card-content month-content">
         <div class="message">
            <p>Visão geral do seu <span>Mês</span></p>
            <p class="caption">
               Resumo do mês.
            </p>
         </div>
         <canvas id="monthChart" class="chart"></canvas>
         <div class="no-chart-message" style="display:none;">
            <p>Não há tarefas para o mês.</p>
            <img src="../images/empty.gif" alt="Sem tarefas" />
         </div>
      </div>
   `;

   const progressContent = `
      <div class="card-content progress-content">
         <div class="message">
            <p> Visão geral do seu <span>Progresso</span></p>
            <p class="caption">
               Resumo do progresso do mês.
            </p>
         </div>
         <canvas id="progressChart" class="chart"></canvas>
         <div class="no-chart-message" style="display:none;">
            <p>Não há tarefas para o mês.</p>
            <img src="../images/empty.gif" alt="Sem tarefas" />
         </div>
      </div>
   `;

   const todayTeamContent = `
      <div class="card-content today-team-content">
         <div class="message">
            <p> Visão geral do <span>Dia</span> da <span>Equipe</span></p>
            <p class="caption">
               Resumo do dia da equipe.
            </p>
         </div>
         <canvas id="todayTeamChart" class="chart"></canvas>
         <div class="no-chart-message" style="display:none;">
            <p>Não há tarefas da equipe para o dia.</p>
            <img src="../images/empty.gif" alt="Sem tarefas" />
         </div>
      </div>
   `;

   const monthTeamContent = `
      <div class="card-content month-team-content">
         <div class="message">
            <p> Visão geral do <span>Mês</span> da <span>Equipe</span></p>
            <p class="caption">
               Resumo do mês da equipe.
            </p>
         </div>
         <canvas id="monthTeamChart" class="chart"></canvas>
         <div class="no-chart-message" style="display:none;">
            <p>Não há tarefas da equipe para o mês.</p>
            <img src="../images/empty.gif" alt="Sem tarefas" />
         </div>
      </div>
   `;

   // Conteúdo do card de auxiliares
   const auxiliaresTeamContent = `
      <div class="card-content auxiliares-team-content">
         <div class="message">
            <p>Visão geral dos <span>Auxiliares</span></p>
            <select id="auxiliarSelect" class="responsavel-select">
               <option value="todos">Todos</option>
               <!-- Outras opções serão adicionadas dinamicamente -->
            </select>
         </div>
         <canvas id="auxiliaresTeamChart" class="chart"></canvas>
         <div class="no-chart-message" style="display:none;">
            <p>Não há tarefas de auxiliares para o mês.</p>
            <img src="../images/empty.gif" alt="Sem tarefas" />
         </div>
      </div>
      `;

   const analistasTeamContent = `
      <div class="card-content analistas-team-content">
         <div class="message">
            <p> Visão geral dos <span>Analistas</span></p>
            <select id="analistaSelect" class="responsavel-select">
               <option value="todos">Todos</option>
               <!-- Outras opções serão adicionadas dinamicamente -->
            </select>
         </div>
         <canvas id="analistasTeamChart" class="chart"></canvas>
         <div class="no-chart-message" style="display:none;">
            <p>Não há tarefas de analistas para o mês.</p>
            <img src="../images/empty.gif" alt="Sem tarefas" />
         </div>
      </div>
   `;

   // Função para verificar o cargo e definir o tipo de dashboard
   dashboardCargo = userInfo.cargo;

   if (dashboardCargo === "Coordenador") {
      dashboardType = "admin";
   }

   if (dashboardCargo === "Líder") {
      dashboardType = "lider";
   }

   if (dashboardCargo === "Analista" || dashboardCargo === "Auxiliar") {
      dashboardType = "user";
   }

   // Cria a estrutura do dashboard dinamicamente
   let dashboardHTML = "";

   switch (dashboardType) {
      case "user":
         dashboardHTML = `
            <div class="row two-columns">
               <div class="dashboard-card welcome-card">${welcomeContent}</div>
               <div class="dashboard-card today-content">${todayContent}</div>
            </div>
            <div class="row two-columns">    
               <div class="dashboard-card month-card">${monthContent}</div>
               <div class="dashboard-card progress-card">${progressContent}</div>
            </div>
        `;
         break;
      case "lider":
         dashboardHTML = `
            <div class="row two-columns">
               <div class="dashboard-card welcome-card">${welcomeContent}</div>
               <div class="dashboard-card today-card">${todayContent}</div>
            </div>
            <div class="row two-columns">    
               <div class="dashboard-card month-card">${monthContent}</div>
               <div class="dashboard-card progress-card">${progressContent}</div>
            </div>
            <div class="row two-columns">
               <div class="dashboard-card today-team-card">${todayTeamContent}</div>
               <div class="dashboard-card month-team-card">${monthTeamContent}</div>
            </div>
            <div class="row two-columns">
               <div class="dashboard-card auxiliares-team-card">${auxiliaresTeamContent}</div>
               <div class="dashboard-card analistas-team-card">${analistasTeamContent}</div>
            </div>
        `;
         break;
      case "admin":
         dashboardHTML = `
            <div class="row two-columns">
               <div class="dashboard-card welcome-card">${welcomeContent}</div>
               <div class="dashboard-card today-content">${todayContent}</div>
            </div>
            <div class="row two-columns">    
               <div class="dashboard-card month-card">${monthContent}</div>
               <div class="dashboard-card progress-card">${progressContent}</div>
            </div>
        `;
         break;
      default:
         return "";
   }

   // Adiciona o HTML ao contêiner .dashboard-container
   dashboardContent.innerHTML = dashboardHTML;
   // Verificar para ver quais gráficos serão preenchidos
   if (dashboardType == "user") {
      atualizarGraficosUser();
   }

   if (dashboardType === "lider") {
      atualizarGraficosLider();
   }
}

// Chama a função principal para criar o dashboard
createDashboard(dashboardCargo, userInfo);
hideLoadingModal();

// Função para o gráfico das tarefas de hoje
async function preencherGraficoTarefasDiaAtual() {
   const todayChart = {
      labels: ["Pendente", "Atrasada", "Concluída"],
      datasets: [
         {
            label: "Tarefas do Dia",
            data: [0, 0, 0],
            backgroundColor: ["rgb(255, 255, 69)", "salmon", "lightgreen"],
            hoverOffset: 4,
         },
      ],
   };

   try {
      const resultado = await window.electronAPI.obterTarefasUsuarioDiaAtual(
         userId
      );
      console.log("resultado:", resultado);

      // Verifique se o resultado é válido
      if (resultado.success && Array.isArray(resultado.tarefas)) {
         let pendentes = 0;
         let atrasadas = 0;
         let concluídas = 0;

         // Conta as tarefas em cada status
         resultado.tarefas.forEach((tarefa) => {
            if (tarefa && tarefa.status) {
               switch (tarefa.status) {
                  case "Pendente":
                     pendentes++;
                     break;
                  case "Atrasada":
                     atrasadas++;
                     break;
                  case "Concluída":
                     concluídas++;
                     break;
               }
            }
         });

         // Atualiza os dados do gráfico com os contadores
         todayChart.datasets[0].data = [pendentes, atrasadas, concluídas];

         const todayChartElement = document.getElementById("todayChart");
         const noChartMessage = document.querySelector(".no-chart-message");

         // Verifica se há tarefas para exibir
         if (pendentes === 0 && atrasadas === 0 && concluídas === 0) {
            todayChartElement.style.display = "none";
            noChartMessage.style.display = "block";

            return;
         } else {
            todayChartElement.style.display = "block";
            noChartMessage.style.display = "none";

            const ctx = todayChartElement.getContext("2d");
            const chart = new Chart(ctx, {
               type: "doughnut",
               data: todayChart,
               options: {
                  responsive: true,
                  plugins: {
                     legend: {
                        position: "top",
                        labels: {
                           font: {
                              size: 14,
                              weight: "bold",
                           },
                        },
                     },
                     tooltip: {
                        callbacks: {
                           label: function (tooltipItem) {
                              return tooltipItem.label + ": " + tooltipItem.raw;
                           },
                        },
                     },
                  },
               },
            });
         }
      } else {
         console.error("Dados de tarefas inválidos:", resultado);
      }
   } catch (error) {
      console.error("Erro ao preencher gráfico:", error);
   }
}

// Função para o gráfico das tarefas do mês
async function preencherGraficoTarefasMesAtual() {
   const monthChart = {
      labels: ["Pendente", "Atrasada", "Concluída"],
      datasets: [
         {
            label: "Tarefas do Mês",
            data: [0, 0, 0],
            backgroundColor: ["rgb(255, 255, 69)", "salmon", "lightgreen"],
            hoverOffset: 4,
         },
      ],
   };

   try {
      const resultado = await window.electronAPI.obterTarefasUsuario(userId);
      console.log("resultado:", resultado);

      // Verifique se o resultado é válido
      if (resultado.success && Array.isArray(resultado.tarefas)) {
         let pendentes = 0;
         let atrasadas = 0;
         let concluídas = 0;

         // Conta as tarefas em cada status
         resultado.tarefas.forEach((tarefa) => {
            if (tarefa && tarefa.status) {
               switch (tarefa.status) {
                  case "Pendente":
                     pendentes++;
                     break;
                  case "Atrasada":
                     atrasadas++;
                     break;
                  case "Concluída":
                     concluídas++;
                     break;
               }
            }
         });

         // Atualiza os dados do gráfico com os contadores
         monthChart.datasets[0].data = [pendentes, atrasadas, concluídas];

         const monthChartElement = document.getElementById("monthChart");
         const noChartMessage = document.querySelector(
            ".month-content .no-chart-message"
         );

         // Verifica se há tarefas para exibir
         if (pendentes === 0 && atrasadas === 0 && concluídas === 0) {
            monthChartElement.style.display = "none";
            noChartMessage.style.display = "block";
            return;
         } else {
            monthChartElement.style.display = "block";
            noChartMessage.style.display = "none";

            const ctx = monthChartElement.getContext("2d");
            const chart = new Chart(ctx, {
               type: "doughnut",
               data: monthChart,
               options: {
                  responsive: true,
                  plugins: {
                     legend: {
                        position: "top",
                        labels: {
                           font: {
                              size: 14,
                              weight: "bold",
                           },
                        },
                     },
                     tooltip: {
                        callbacks: {
                           label: function (tooltipItem) {
                              return tooltipItem.label + ": " + tooltipItem.raw;
                           },
                        },
                     },
                  },
               },
            });
         }
      } else {
         console.error("Dados de tarefas inválidos:", resultado);
      }
   } catch (error) {
      console.error("Erro ao preencher gráfico:", error);
   }
}

// Função para o gráfico de progresso individual
async function preencherGraficoProgresso() {
   const progressChart = {
      labels: ["Concluídas", "Não Concluídas"],
      datasets: [
         {
            label: "Porcentagem de Tarefas",
            data: [0, 0],
            backgroundColor: ["lightgreen", "lightgray"],
            hoverOffset: 4,
         },
      ],
   };

   try {
      const resultado = await window.electronAPI.obterTarefasUsuario(userId);
      console.log("resultado tarefas:", resultado);

      if (resultado.success && Array.isArray(resultado.tarefas)) {
         let totalTarefas = 0;
         let concluídas = 0;

         resultado.tarefas.forEach((tarefa) => {
            if (tarefa && tarefa.status) {
               totalTarefas++;
               if (tarefa.status === "Concluída") {
                  concluídas++;
               }
            }
         });

         // Calcula as não concluídas
         const naoConcluidas = totalTarefas - concluídas;

         // Atualiza os dados do gráfico
         progressChart.datasets[0].data = [concluídas, naoConcluidas];

         const progressChartElement = document.getElementById("progressChart");
         const noChartMessage = document.querySelector(
            ".progress-content .no-chart-message"
         );

         // Verifica se o gráfico e a mensagem existem
         if (progressChartElement && noChartMessage) {
            if (totalTarefas === 0) {
               progressChartElement.style.display = "none";
               noChartMessage.style.display = "block";
            } else {
               progressChartElement.style.display = "block";
               noChartMessage.style.display = "none";

               const ctx = progressChartElement.getContext("2d");
               new Chart(ctx, {
                  type: "pie",
                  data: progressChart,
                  options: {
                     responsive: true,
                     plugins: {
                        legend: {
                           position: "top",
                           labels: {
                              font: {
                                 size: 14,
                                 weight: "bold",
                              },
                           },
                        },
                        tooltip: {
                           callbacks: {
                              label: function (tooltipItem) {
                                 const total =
                                    progressChart.datasets[0].data.reduce(
                                       (a, b) => a + b,
                                       0
                                    );
                                 const valor = tooltipItem.raw;

                                 const porcentagem =
                                    total > 0
                                       ? ((valor / total) * 100).toFixed(2)
                                       : 0;

                                 return `${tooltipItem.label}: ${porcentagem}%`;
                              },
                           },
                        },
                     },
                  },
               });
            }
         } else {
            console.error("Elemento gráfico ou mensagem não encontrado");
         }
      } else {
         console.error("Dados de tarefas inválidos:", resultado);
      }
   } catch (error) {
      console.error("Erro ao preencher gráfico de progresso:", error);
   }
}

// Função para o gráfico das tarefas da equipe para o dia atual
async function preencherGraficoTarefasEquipeDiaAtual() {
   const todayTeamChart = {
      labels: ["Pendente", "Atrasada", "Concluída"],
      datasets: [
         {
            label: "Tarefas da Equipe no Dia Atual",
            data: [0, 0, 0],
            backgroundColor: ["rgb(255, 255, 69)", "salmon", "lightgreen"],
            hoverOffset: 4,
         },
      ],
   };

   try {
      const resultado = await window.electronAPI.obterTarefasEquipeDiaAtual(
         userId
      );
      console.log("resultado equipe dia atual:", resultado);

      // Verifique se o resultado é válido
      if (resultado.success && Array.isArray(resultado.tarefas)) {
         let pendentes = 0;
         let atrasadas = 0;
         let concluídas = 0;

         // Conta as tarefas em cada status
         resultado.tarefas.forEach((tarefa) => {
            if (tarefa && tarefa.status) {
               switch (tarefa.status) {
                  case "Pendente":
                     pendentes++;
                     break;
                  case "Atrasada":
                     atrasadas++;
                     break;
                  case "Concluída":
                     concluídas++;
                     break;
               }
            }
         });

         // Atualiza os dados do gráfico com os contadores
         todayTeamChart.datasets[0].data = [pendentes, atrasadas, concluídas];

         const todayTeamChartElement =
            document.getElementById("todayTeamChart");
         const noChartMessage = document.querySelector(
            ".today-team-content .no-chart-message"
         );

         // Verifica se há tarefas para exibir
         if (pendentes === 0 && atrasadas === 0 && concluídas === 0) {
            todayTeamChartElement.style.display = "none";
            noChartMessage.style.display = "block";
            return;
         } else {
            todayTeamChartElement.style.display = "block";
            noChartMessage.style.display = "none";

            const ctx = todayTeamChartElement.getContext("2d");
            const chart = new Chart(ctx, {
               type: "doughnut",
               data: todayTeamChart,
               options: {
                  responsive: true,
                  plugins: {
                     legend: {
                        position: "top",
                        labels: {
                           font: {
                              size: 14,
                              weight: "bold",
                           },
                        },
                     },
                     tooltip: {
                        callbacks: {
                           label: function (tooltipItem) {
                              return tooltipItem.label + ": " + tooltipItem.raw;
                           },
                        },
                     },
                  },
               },
            });
         }
      } else {
         console.error("Dados de tarefas da equipe inválidos:", resultado);
      }
   } catch (error) {
      console.error(
         "Erro ao preencher gráfico de tarefas da equipe para o dia atual:",
         error
      );
   }
}

// Função para o gráfico das tarefas do mês da equipe
async function preencherGraficoTarefasEquipeMesAtual() {
   const monthTeamChart = {
      labels: ["Pendente", "Atrasada", "Concluída"],
      datasets: [
         {
            label: "Tarefas da Equipe no Mês",
            data: [0, 0, 0],
            backgroundColor: ["rgb(255, 255, 69)", "salmon", "lightgreen"],
            hoverOffset: 4,
         },
      ],
   };

   try {
      const resultado = await window.electronAPI.obterTarefasEquipe(userId);
      console.log("resultado equipe:", resultado);

      // Verifique se o resultado é válido
      if (resultado.success && Array.isArray(resultado.tarefas)) {
         let pendentes = 0;
         let atrasadas = 0;
         let concluídas = 0;

         // Conta as tarefas em cada status
         resultado.tarefas.forEach((tarefa) => {
            if (tarefa && tarefa.status) {
               switch (tarefa.status) {
                  case "Pendente":
                     pendentes++;
                     break;
                  case "Atrasada":
                     atrasadas++;
                     break;
                  case "Concluída":
                     concluídas++;
                     break;
               }
            }
         });

         // Atualiza os dados do gráfico com os contadores
         monthTeamChart.datasets[0].data = [pendentes, atrasadas, concluídas];

         const monthTeamChartElement =
            document.getElementById("monthTeamChart");
         const noChartMessage = document.querySelector(
            ".month-team-content .no-chart-message"
         );

         // Verifica se há tarefas para exibir
         if (pendentes === 0 && atrasadas === 0 && concluídas === 0) {
            monthTeamChartElement.style.display = "none";
            noChartMessage.style.display = "block";
            return;
         } else {
            monthTeamChartElement.style.display = "block";
            noChartMessage.style.display = "none";

            const ctx = monthTeamChartElement.getContext("2d");
            const chart = new Chart(ctx, {
               type: "doughnut",
               data: monthTeamChart,
               options: {
                  responsive: true,
                  plugins: {
                     legend: {
                        position: "top",
                        labels: {
                           font: {
                              size: 14,
                              weight: "bold",
                           },
                        },
                     },
                     tooltip: {
                        callbacks: {
                           label: function (tooltipItem) {
                              return tooltipItem.label + ": " + tooltipItem.raw;
                           },
                        },
                     },
                  },
               },
            });
         }
      } else {
         console.error("Dados de tarefas da equipe inválidos:", resultado);
      }
   } catch (error) {
      console.error("Erro ao preencher gráfico de tarefas da equipe:", error);
   }
}

// Variável global para armazenar a instância do gráfico
let auxiliaresChartInstance = null;

// Função para o gráfico das tarefas dos auxiliares
async function preencherGraficoTarefasAuxiliaresMesAtual(auxiliarSelecionado) {
   const tarefasConcluidas = {};
   const tarefasTotal = {};

   try {
      const resultado = await window.electronAPI.obterTarefasAuxiliaresEquipe(
         userId
      );
      console.log("resultado auxiliares:", resultado);

      if (resultado.success && Array.isArray(resultado.tarefas)) {
         resultado.tarefas.forEach((tarefa) => {
            const responsavel = tarefa.responsavel;
            const nomeResponsavel = responsavel.nome;

            // Filtra tarefas de acordo com o auxiliar selecionado
            if (
               auxiliarSelecionado === "todos" ||
               nomeResponsavel === auxiliarSelecionado
            ) {
               if (!tarefasTotal[nomeResponsavel]) {
                  tarefasTotal[nomeResponsavel] = 0;
               }
               tarefasTotal[nomeResponsavel]++;

               if (tarefa.status === "Concluída") {
                  if (!tarefasConcluidas[nomeResponsavel]) {
                     tarefasConcluidas[nomeResponsavel] = 0;
                  }
                  tarefasConcluidas[nomeResponsavel]++;
               }
            }
         });

         const auxiliaresTeamChartElement = document.getElementById(
            "auxiliaresTeamChart"
         );
         const noChartMessage = document.querySelector(
            ".auxiliares-team-content .no-chart-message"
         );

         // Verifica se há tarefas para exibir
         if (Object.values(tarefasTotal).every((count) => count === 0)) {
            auxiliaresTeamChartElement.style.display = "none";
            noChartMessage.style.display = "block";
            return;
         } else {
            auxiliaresTeamChartElement.style.display = "block";
            noChartMessage.style.display = "none";

            // Destrói o gráfico anterior, se existir
            if (auxiliaresChartInstance) {
               auxiliaresChartInstance.destroy();
            }

            const ctx = auxiliaresTeamChartElement.getContext("2d");
            const chartData = await gerarGraficoResponsavel(
               auxiliarSelecionado,
               tarefasConcluidas,
               tarefasTotal
            );

            auxiliaresChartInstance = new Chart(ctx, {
               type: auxiliarSelecionado === "todos" ? "bar" : "doughnut",
               data: chartData,
               options: {
                  responsive: true,
                  indexAxis: auxiliarSelecionado === "todos" ? "y" : undefined,
                  scales:
                     auxiliarSelecionado === "todos"
                        ? { x: { stacked: false }, y: { stacked: false } }
                        : undefined,
                  elements: {
                     bar: {
                        barThickness: 20,
                     },
                  },
                  plugins: {
                     legend: {
                        position: "top",
                        labels: {
                           font: {
                              size: 14,
                              weight: "bold",
                           },
                        },
                     },
                     tooltip: {
                        callbacks: {
                           label: function (tooltipItem) {
                              const datasetLabel = tooltipItem.dataset.label;
                              const taskCount = tooltipItem.raw;
                              return datasetLabel === "Total de Tarefas"
                                 ? `Total de Tarefas: ${taskCount}`
                                 : datasetLabel === "Tarefas Concluídas"
                                 ? `Tarefas Concluídas: ${taskCount}`
                                 : `Tarefas: ${taskCount}`;
                           },
                        },
                     },
                  },
               },
            });
         }
      } else {
         console.error("Dados de tarefas dos auxiliares inválidos:", resultado);
      }
   } catch (error) {
      console.error(
         "Erro ao preencher gráfico de tarefas dos auxiliares:",
         error
      );
   }
}

// Variável global para armazenar a instância do gráfico
let analistasChartInstance = null;

// Função para o gráfico das tarefas dos analistas
async function preencherGraficoTarefasAnalistasMesAtual(analistaSelecionado) {
   const tarefasConcluidas = {};
   const tarefasTotal = {};

   try {
      const resultado = await window.electronAPI.obterTarefasAnalistasEquipe(
         userId
      );
      console.log("resultado analistas:", resultado);

      // Verifique se o resultado é válido
      if (resultado.success && Array.isArray(resultado.tarefas)) {
         resultado.tarefas.forEach((tarefa) => {
            if (tarefa) {
               const nomeResponsavel = tarefa.responsavel.nome;

               // Filtra tarefas de acordo com o analista selecionado
               if (
                  analistaSelecionado === "todos" ||
                  nomeResponsavel === analistaSelecionado
               ) {
                  // Incrementa o total de tarefas
                  if (!tarefasTotal[nomeResponsavel]) {
                     tarefasTotal[nomeResponsavel] = 0;
                  }
                  tarefasTotal[nomeResponsavel]++;

                  // Incrementa as tarefas concluídas
                  if (tarefa.status === "Concluída") {
                     if (!tarefasConcluidas[nomeResponsavel]) {
                        tarefasConcluidas[nomeResponsavel] = 0;
                     }
                     tarefasConcluidas[nomeResponsavel]++;
                  }
               }
            }
         });

         const analistasTeamChartElement =
            document.getElementById("analistasTeamChart");
         const noChartMessage = document.querySelector(
            ".analistas-team-content .no-chart-message"
         );

         // Verifica se há tarefas para exibir
         if (Object.values(tarefasTotal).every((count) => count === 0)) {
            analistasTeamChartElement.style.display = "none";
            noChartMessage.style.display = "block";
            return;
         } else {
            analistasTeamChartElement.style.display = "block";
            noChartMessage.style.display = "none";

            // Destrói o gráfico anterior, se existir
            if (analistasChartInstance) {
               analistasChartInstance.destroy();
            }

            const ctx = analistasTeamChartElement.getContext("2d");
            const chartData = await gerarGraficoResponsavel(
               analistaSelecionado,
               tarefasConcluidas,
               tarefasTotal
            );

            analistasChartInstance = new Chart(ctx, {
               type: analistaSelecionado === "todos" ? "bar" : "doughnut",
               data: chartData,
               options: {
                  responsive: true,
                  indexAxis: analistaSelecionado === "todos" ? "y" : undefined,
                  scales:
                     analistaSelecionado === "todos"
                        ? { x: { stacked: false }, y: { stacked: false } }
                        : undefined,
                  elements: {
                     bar: {
                        barThickness: 20,
                     },
                  },
                  plugins: {
                     legend: {
                        position: "top",
                        labels: {
                           font: {
                              size: 14,
                              weight: "bold",
                           },
                        },
                     },
                     tooltip: {
                        callbacks: {
                           label: function (tooltipItem) {
                              const datasetLabel = tooltipItem.dataset.label;
                              const taskCount = tooltipItem.raw;
                              return datasetLabel === "Total de Tarefas"
                                 ? `Total de Tarefas: ${taskCount}`
                                 : datasetLabel === "Tarefas Concluídas"
                                 ? `Tarefas Concluídas: ${taskCount}`
                                 : `Tarefas: ${taskCount}`;
                           },
                        },
                     },
                  },
               },
            });
         }
      } else {
         console.error("Dados de tarefas dos analistas inválidos:", resultado);
      }
   } catch (error) {
      console.error(
         "Erro ao preencher gráfico de tarefas dos analistas:",
         error
      );
   }
}

// Função para preencher o select com os responsáveis
async function preencherSelectAuxiliares() {
   const selectElement = document.getElementById("auxiliarSelect");

   // Limpar opções existentes (exceto "Todos")
   selectElement.innerHTML = '<option value="todos">Todos</option>';

   try {
      const resultado = await window.electronAPI.obterTarefasAuxiliaresEquipe(
         userId
      );

      // Verifique se o resultado é válido
      if (resultado.success && Array.isArray(resultado.tarefas)) {
         const auxiliares = [
            ...new Set(
               resultado.tarefas.map((tarefa) => tarefa.responsavel.nome)
            ),
         ];

         auxiliares.forEach((auxiliar) => {
            const option = document.createElement("option");
            option.value = auxiliar;
            option.textContent = auxiliar;
            selectElement.appendChild(option);
         });

         // Atualiza o gráfico inicial com "Todos" selecionado
         await preencherGraficoTarefasAuxiliaresMesAtual("todos");
      }
   } catch (error) {
      console.error("Erro ao preencher select de auxiliares:", error);
   }
}

// Adicionar evento ao select
document
   .getElementById("auxiliarSelect")
   .addEventListener("change", (event) => {
      const auxiliarSelecionado = event.target.value;
      preencherGraficoTarefasAuxiliaresMesAtual(auxiliarSelecionado);
   });

// Função para preencher o select com os responsáveis
async function preencherSelectAnalistas() {
   const selectElement = document.getElementById("analistaSelect");

   // Limpar opções existentes (exceto "Todos")
   selectElement.innerHTML = '<option value="todos">Todos</option>';

   try {
      const resultado = await window.electronAPI.obterTarefasAnalistasEquipe(
         userId
      );

      // Verifique se o resultado é válido
      if (resultado.success && Array.isArray(resultado.tarefas)) {
         const analistas = [
            ...new Set(
               resultado.tarefas.map((tarefa) => tarefa.responsavel.nome)
            ),
         ];

         analistas.forEach((analista) => {
            const option = document.createElement("option");
            option.value = analista;
            option.textContent = analista;
            selectElement.appendChild(option);
         });

         // Atualiza o gráfico inicial com "Todos" selecionado
         await preencherGraficoTarefasAnalistasMesAtual("todos");
      }
   } catch (error) {
      console.error("Erro ao preencher select de analistas:", error);
   }
}

// Adicionar evento ao select
document
   .getElementById("analistaSelect")
   .addEventListener("change", (event) => {
      const analistaSelecionado = event.target.value;
      preencherGraficoTarefasAnalistasMesAtual(analistaSelecionado);
   });

// Função para gerar o gráfico de um responsável específico
async function gerarGraficoResponsavel(
   auxiliarSelecionado,
   tarefasConcluidas,
   tarefasTotal
) {
   const chartData = {
      labels: [],
      datasets: [],
   };

   if (auxiliarSelecionado === "todos") {
      // Gráfico de barras
      chartData.labels = Object.keys(tarefasTotal); // Os nomes dos responsáveis
      chartData.datasets.push({
         label: "Total de Tarefas",
         data: Object.values(tarefasTotal), // Total de tarefas para cada responsável
         backgroundColor: "lightgray",
         hoverOffset: 4,
      });
      chartData.datasets.push({
         label: "Tarefas Concluídas",
         data: chartData.labels.map(
            (responsavel) => tarefasConcluidas[responsavel] || 0
         ), // Tarefas concluídas por responsável
         backgroundColor: "lightgreen",
         hoverOffset: 4,
      });
   } else {
      // Gráfico de rosca para um auxiliar específico
      const totalConcluidas = tarefasConcluidas[auxiliarSelecionado] || 0;
      const totalTarefas = tarefasTotal[auxiliarSelecionado] || 0;
      const totalNaoConcluidas = totalTarefas - totalConcluidas;

      chartData.labels = ["Concluídas", "Não Concluídas"];
      chartData.datasets.push({
         label: "Tarefas",
         data: [totalConcluidas, totalNaoConcluidas], // Dados para gráfico de rosca
         backgroundColor: ["lightgreen", "lightgray"],
         hoverOffset: 4,
      });
   }

   return chartData;
}

// Função para atualizar os gráficos user no Dashboard
async function atualizarGraficosUser() {
   try {
      await preencherGraficoTarefasDiaAtual();

      await preencherGraficoTarefasMesAtual();

      await preencherGraficoProgresso();
   } catch (error) {
      console.error("Erro ao atualizar gráficos:", error);
   }
}

// Função para atualizar os gráficos líder no Dashboard
async function atualizarGraficosLider() {
   try {
      await preencherGraficoTarefasDiaAtual();

      await preencherGraficoTarefasMesAtual();

      await preencherGraficoProgresso();

      await preencherGraficoTarefasEquipeDiaAtual();

      await preencherGraficoTarefasEquipeMesAtual();

      await preencherGraficoTarefasAuxiliaresMesAtual();

      await preencherGraficoTarefasAnalistasMesAtual();

      await preencherSelectAuxiliares();

      await preencherSelectAnalistas();
   } catch (error) {
      console.error("Erro ao atualizar gráficos:", error);
   }
}
