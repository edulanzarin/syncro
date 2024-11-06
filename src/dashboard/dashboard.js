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

if (!userInfo) {
   setTimeout(() => {
      location.reload();
   }, 5000);
}

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
         </div>
         <div class="container-chart">
            <canvas class="chart" id="todayChart"></canvas>
         </div>
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
         </div>
         <div class="container-chart">
            <canvas id="monthChart" class="chart"></canvas>
         </div>   
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
         </div>
         <div class="container-chart">
            <canvas id="progressChart" class="chart"></canvas>
         </div>
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
         </div>
         <div class="container-chart">
            <canvas id="todayTeamChart" class="chart"></canvas>
         </div>
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
         </div>
         <div class="container-chart">
            <canvas id="monthTeamChart" class="chart"></canvas>
         </div>
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
         </div>
         <div class="container-chart">
            <canvas id="auxiliaresTeamChart" class="chart"></canvas>
         </div>
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
         </div>
         <div class="container-chart">
            <canvas id="analistasTeamChart" class="chart"></canvas>
         </div>
         <div class="no-chart-message" style="display:none;">
            <p>Não há tarefas de analistas para o mês.</p>
            <img src="../images/empty.gif" alt="Sem tarefas" />
         </div>
      </div>
   `;

   const setorContent = `
      <div class="card-content setor-content">
         <div class="message">
            <p> Visão geral do <span>Setor</span></p>
         </div>
         <div class="container-chart">
            <canvas id="setorChart" class="chart"></canvas>
         </div>
         <div class="no-chart-message" style="display:none;">
            <p>Não há tarefas do setor para o mês.</p>
            <img src="../images/empty.gif" alt="Sem tarefas" />
         </div>
      </div>
   `;

   const comercioContent = `
      <div class="card-content comercio-content">
         <div class="message">
            <p> Visão geral do <span>Comércio</span></p>
         </div>
         <div class="container-chart">
            <canvas id="comercioChart" class="chart"></canvas>
         </div>
         <div class="no-chart-message" style="display:none;">
            <p>Não há tarefas do setor para o mês.</p>
            <img src="../images/empty.gif" alt="Sem tarefas" />
         </div>
      </div>
   `;

   const auxiliaresComercioContent = `
      <div class="card-content auxiliares-comercio-content">
         <div class="message">
            <p>Visão geral dos <span>Auxiliares</span> do <span id="setorNome">Comércio</span></p>
         </div>
         <div class="container-chart">
            <canvas id="auxiliaresComercioChart" class="chart"></canvas>
         </div>
         <div class="no-chart-message" style="display:none;">
            <p>Não há tarefas do setor para o mês.</p>
            <img src="../images/empty.gif" alt="Sem tarefas" />
         </div>
      </div>
   `;

   const analistasComercioContent = `
      <div class="card-content analistas-comercio-content">
         <div class="message">
            <p>Visão geral dos <span>Analistas</span> do <span id="setorNome">Comércio</span></p>
         </div>
         <div class="container-chart">
            <canvas id="analistasComercioChart" class="chart"></canvas>
         </div>
         <div class="no-chart-message" style="display:none;">
            <p>Não há tarefas do setor para o mês.</p>
            <img src="../images/empty.gif" alt="Sem tarefas" />
         </div>
      </div>
   `;

   const supermercadoContent = `
      <div class="card-content supermercado-content">
         <div class="message">
            <p> Visão geral do <span>Supermercado</span></p>
         </div>
         <div class="container-chart">
            <canvas id="supermercadoChart" class="chart"></canvas>
         </div>
         <div class="no-chart-message" style="display:none;">
            <p>Não há tarefas do setor para o mês.</p>
            <img src="../images/empty.gif" alt="Sem tarefas" />
         </div>
      </div>
   `;

   const auxiliaresSupermercadoContent = `
      <div class="card-content auxiliares-supermercado-content">
         <div class="message">
            <p>Visão geral dos <span>Auxiliares</span> do <span id="setorNome">Supermercado</span></p>
         </div>
         <div class="container-chart">
            <canvas id="auxiliaresSupermercadoChart" class="chart"></canvas>
         </div>
         <div class="no-chart-message" style="display:none;">
            <p>Não há tarefas do setor para o mês.</p>
            <img src="../images/empty.gif" alt="Sem tarefas" />
         </div>
      </div>
   `;

   const analistasSupermercadoContent = `
      <div class="card-content analistas-supermercado-content">
         <div class="message">
            <p>Visão geral dos <span>Analistas</span> do <span id="setorNome">Supermercado</span></p>
         </div>
         <div class="container-chart">
            <canvas id="analistasSupermercadoChart" class="chart"></canvas>
         </div>
         <div class="no-chart-message" style="display:none;">
            <p>Não há tarefas do setor para o mês.</p>
            <img src="../images/empty.gif" alt="Sem tarefas" />
         </div>
      </div>
   `;

   const industriaContent = `
      <div class="card-content industria-content">
         <div class="message">
            <p> Visão geral da <span>Indústria</span></p>
         </div>
         <div class="container-chart">
            <canvas id="industriaChart" class="chart"></canvas>
         </div>
         <div class="no-chart-message" style="display:none;">
            <p>Não há tarefas do setor para o mês.</p>
            <img src="../images/empty.gif" alt="Sem tarefas" />
         </div>
      </div>
   `;

   const auxiliaresIndustriaContent = `
      <div class="card-content auxiliares-industria-content">
         <div class="message">
            <p>Visão geral dos <span>Auxiliares</span> da <span id="setorNome">Indústria</span></p>
         </div>
         <div class="container-chart">
            <canvas id="auxiliaresIndustriaChart" class="chart"></canvas>
         </div>
         <div class="no-chart-message" style="display:none;">
            <p>Não há tarefas do setor para o mês.</p>
            <img src="../images/empty.gif" alt="Sem tarefas" />
         </div>
      </div>
   `;

   const analistasIndustriaContent = `
      <div class="card-content analistas-industria-content">
         <div class="message">
            <p>Visão geral dos <span>Analistas</span> da <span id="setorNome">Indústria</span></p>
         </div>
         <div class="container-chart">
            <canvas id="analistasIndustriaChart" class="chart"></canvas>
         </div>
         <div class="no-chart-message" style="display:none;">
            <p>Não há tarefas do setor para o mês.</p>
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
            <div class="row one-column">
               <div class="dashboard-card welcome-card">${welcomeContent}</div>
            </div>
            <div class="row three-columns">    
               <div class="dashboard-card today-content">${todayContent}</div>
               <div class="dashboard-card month-card">${monthContent}</div>
               <div class="dashboard-card progress-card">${progressContent}</div>
            </div>
        `;
         break;
      case "lider":
         dashboardHTML = `
            <div class="row one-column">
               <div class="dashboard-card welcome-card">${welcomeContent}</div>
            </div>
            <div class="row three-columns">    
               <div class="dashboard-card today-content">${todayContent}</div>
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
            <div class="row one-column">
               <div class="dashboard-card welcome-card">${welcomeContent}</div>
            </div>
            <div class="row three-columns">    
               <div class="dashboard-card today-content">${todayContent}</div>
               <div class="dashboard-card month-card">${monthContent}</div>
               <div class="dashboard-card progress-card">${progressContent}</div>
            </div>
            <div class="row one-column">
               <div class="dashboard-card setor-card">${setorContent}</div>
            </div>
            <div class="row three-columns">
               <div class="dashboard-card comercio-card">${comercioContent}</div>
               <div class="dashboard-card supermercado-card">${auxiliaresComercioContent}</div>
               <div class="dashboard-card industria-card">${analistasComercioContent}</div>
            </div>
            <div class="row three-columns">
               <div class="dashboard-card supermercado-card">${supermercadoContent}</div>
               <div class="dashboard-card supermercado-card">${auxiliaresSupermercadoContent}</div>
               <div class="dashboard-card supermercado-card">${analistasSupermercadoContent}</div>
            </div>
            <div class="row three-columns">
               <div class="dashboard-card industria-card">${industriaContent}</div>
               <div class="dashboard-card industria-card">${auxiliaresIndustriaContent}</div>
               <div class="dashboard-card industria-card">${analistasIndustriaContent}</div>
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

   if (dashboardType === "admin") {
      atualizarGraficosAdmin();
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
            backgroundColor: ["yellow", "red", "green"],
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
            backgroundColor: ["yellow", "red", "green"],
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
            backgroundColor: ["green", "lightgray"],
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
            backgroundColor: ["yellow", "red", "green"],
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
            backgroundColor: ["yellow", "red", "green"],
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

// Função para extrair o primeiro nome e a primeira letra do último nome
function formatarNome(responsavel) {
   const nomes = responsavel.nome.split(" ");
   const primeiroNome = nomes[0];

   // Verifica se há mais de um nome
   if (nomes.length > 1) {
      const ultimoNome = nomes[nomes.length - 1];
      return `${primeiroNome} ${ultimoNome.charAt(0)}.`; // Retorna "PrimeiroNome U."
   }

   // Retorna apenas o primeiro nome se não houver outro
   return primeiroNome;
}

// Função para o gráfico das tarefas dos auxiliares (todos os auxiliares)
async function preencherGraficoTarefasAuxiliaresMesAtual() {
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
            const responsavelId = responsavel.id;
            const nomeResponsavelFormatado = formatarNome(responsavel); // Formata o nome

            // Inicializa contadores para cada auxiliar usando o ID como chave
            if (!tarefasTotal[responsavelId]) {
               tarefasTotal[responsavelId] = {
                  nome: nomeResponsavelFormatado,
                  count: 0,
               };
               tarefasConcluidas[responsavelId] = 0;
            }

            // Conta as tarefas totais e as concluídas por auxiliar
            tarefasTotal[responsavelId].count++;
            if (tarefa.status === "Concluída") {
               tarefasConcluidas[responsavelId]++;
            }
         });

         const auxiliaresTeamChartElement = document.getElementById(
            "auxiliaresTeamChart"
         );
         const noChartMessage = document.querySelector(
            ".auxiliares-team-content .no-chart-message"
         );

         // Verifica se há tarefas para exibir
         if (
            Object.values(tarefasTotal).every(
               (auxiliar) => auxiliar.count === 0
            )
         ) {
            auxiliaresTeamChartElement.style.display = "none";
            noChartMessage.style.display = "block";
            return;
         } else {
            auxiliaresTeamChartElement.style.display = "block";
            noChartMessage.style.display = "none";

            // Destrói o gráfico anterior, se existir
            if (window.auxiliaresChartInstance) {
               window.auxiliaresChartInstance.destroy();
            }

            const ctx = auxiliaresTeamChartElement.getContext("2d");
            const nomesAuxiliares = Object.values(tarefasTotal).map(
               (auxiliar) => auxiliar.nome
            );
            const dadosTarefasTotal = Object.values(tarefasTotal).map(
               (auxiliar) => auxiliar.count
            );
            const dadosTarefasConcluidas = Object.values(tarefasConcluidas);

            // Configuração dos dados do gráfico
            const chartData = {
               labels: nomesAuxiliares,
               datasets: [
                  {
                     label: "Total de Tarefas",
                     data: dadosTarefasTotal,
                     backgroundColor: "lightgray",
                  },
                  {
                     label: "Tarefas Concluídas",
                     data: dadosTarefasConcluidas,
                     backgroundColor: "green",
                  },
               ],
            };

            // Criação do gráfico com o mesmo estilo dos outros
            window.auxiliaresChartInstance = new Chart(ctx, {
               type: "bar",
               data: chartData,
               options: {
                  responsive: true,
                  indexAxis: "y",
                  scales: {
                     x: { stacked: false },
                     y: { stacked: false },
                  },
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
                                 : `Tarefas Concluídas: ${taskCount}`;
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

// Função para o gráfico das tarefas dos analistas (todos os analistas)
async function preencherGraficoTarefasAnalistasMesAtual() {
   const tarefasConcluidas = {};
   const tarefasTotal = {};

   try {
      const resultado = await window.electronAPI.obterTarefasAnalistasEquipe(
         userId
      );
      console.log("resultado analistas:", resultado);

      // Verifica se o resultado é válido
      if (resultado.success && Array.isArray(resultado.tarefas)) {
         resultado.tarefas.forEach((tarefa) => {
            if (tarefa && tarefa.responsavel) {
               const responsavelId = tarefa.responsavel.id;
               const nomeResponsavelFormatado = formatarNome(
                  tarefa.responsavel
               ); // Formata o nome

               // Usa o ID do responsável como chave para garantir que nomes iguais não sejam misturados
               if (!tarefasTotal[responsavelId]) {
                  tarefasTotal[responsavelId] = {
                     nome: nomeResponsavelFormatado,
                     count: 0,
                  };
                  tarefasConcluidas[responsavelId] = 0;
               }

               // Incrementa o total de tarefas e as concluídas para cada analista
               tarefasTotal[responsavelId].count++;
               if (tarefa.status === "Concluída") {
                  tarefasConcluidas[responsavelId]++;
               }
            }
         });

         const analistasTeamChartElement =
            document.getElementById("analistasTeamChart");
         const noChartMessage = document.querySelector(
            ".analistas-team-content .no-chart-message"
         );

         // Verifica se há tarefas para exibir
         if (
            Object.values(tarefasTotal).every(
               (analista) => analista.count === 0
            )
         ) {
            analistasTeamChartElement.style.display = "none";
            noChartMessage.style.display = "block";
            return;
         } else {
            analistasTeamChartElement.style.display = "block";
            noChartMessage.style.display = "none";

            // Destrói o gráfico anterior, se existir
            if (window.analistasChartInstance) {
               window.analistasChartInstance.destroy();
            }

            const ctx = analistasTeamChartElement.getContext("2d");
            const nomesAnalistas = Object.values(tarefasTotal).map(
               (analista) => analista.nome
            );
            const dadosTarefasTotal = Object.values(tarefasTotal).map(
               (analista) => analista.count
            );
            const dadosTarefasConcluidas = Object.values(tarefasConcluidas);

            // Configuração dos dados do gráfico
            const chartData = {
               labels: nomesAnalistas,
               datasets: [
                  {
                     label: "Total de Tarefas",
                     data: dadosTarefasTotal,
                     backgroundColor: "lightgray",
                  },
                  {
                     label: "Tarefas Concluídas",
                     data: dadosTarefasConcluidas,
                     backgroundColor: "green",
                  },
               ],
            };

            // Criação do gráfico
            window.analistasChartInstance = new Chart(ctx, {
               type: "bar",
               data: chartData,
               options: {
                  responsive: true,
                  indexAxis: "y",
                  scales: {
                     x: { stacked: false },
                     y: { stacked: false },
                  },
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
                                 : `Tarefas Concluídas: ${taskCount}`;
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

// Função para o gráfico das tarefas do mês do setor
async function preencherGraficoTarefasSetorMesAtual() {
   const setorChart = {
      labels: ["Pendente", "Atrasada", "Concluída"],
      datasets: [
         {
            label: "Tarefas do Setor no Mês",
            data: [0, 0, 0],
            backgroundColor: ["yellow", "red", "green"],
            hoverOffset: 4,
         },
      ],
   };

   try {
      const resultado = await window.electronAPI.obterTarefasSetor(userId);
      console.log("resultado setor:", resultado);

      // Verifique se o resultado é válido
      if (resultado.success && Array.isArray(resultado.tarefas)) {
         let pendentes = 0;
         let atrasadas = 0;
         let concluidas = 0;

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
                     concluidas++;
                     break;
               }
            }
         });

         // Atualiza os dados do gráfico com os contadores
         setorChart.datasets[0].data = [pendentes, atrasadas, concluidas];

         const setorChartElement = document.getElementById("setorChart");
         const noChartMessage = document.querySelector(
            ".setor-content .no-chart-message"
         );

         // Verifica se há tarefas para exibir
         if (pendentes === 0 && atrasadas === 0 && concluidas === 0) {
            setorChartElement.style.display = "none";
            noChartMessage.style.display = "block";
            return;
         } else {
            setorChartElement.style.display = "block";
            noChartMessage.style.display = "none";

            const ctx = setorChartElement.getContext("2d");
            new Chart(ctx, {
               type: "doughnut",
               data: setorChart,
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
         console.error("Dados de tarefas do setor inválidos:", resultado);
      }
   } catch (error) {
      console.error("Erro ao preencher gráfico de tarefas do setor:", error);
   }
}

// Função para o gráfico das tarefas do mês no segmento Comércio
async function preencherGraficoComercioMesAtual() {
   const comercioChartConfig = {
      labels: ["Pendente", "Atrasada", "Concluída"],
      datasets: [
         {
            label: "Tarefas do Comércio no Mês",
            data: [0, 0, 0],
            backgroundColor: ["yellow", "red", "green"],
            hoverOffset: 4,
         },
      ],
   };

   try {
      const resultado = await window.electronAPI.obterTarefasSetor(userId);
      console.log("resultado setor:", resultado);

      // Verifique se o resultado é válido
      if (resultado.success && Array.isArray(resultado.tarefas)) {
         let pendentes = 0;
         let atrasadas = 0;
         let concluidas = 0;

         // Filtra e conta as tarefas com segmento "Comércio" em cada status
         resultado.tarefas.forEach((tarefa) => {
            if (tarefa && tarefa.segmento === "Comércio" && tarefa.status) {
               switch (tarefa.status) {
                  case "Pendente":
                     pendentes++;
                     break;
                  case "Atrasada":
                     atrasadas++;
                     break;
                  case "Concluída":
                     concluidas++;
                     break;
               }
            }
         });

         // Atualiza os dados do gráfico com os contadores
         comercioChartConfig.datasets[0].data = [
            pendentes,
            atrasadas,
            concluidas,
         ];

         const comercioChartElement = document.getElementById("comercioChart");
         const noChartMessage = document.querySelector(
            ".comercio-content .no-chart-message"
         );

         // Verifica se há tarefas para exibir
         if (pendentes === 0 && atrasadas === 0 && concluidas === 0) {
            comercioChartElement.style.display = "none";
            noChartMessage.style.display = "block";
            return;
         } else {
            comercioChartElement.style.display = "block";
            noChartMessage.style.display = "none";

            const ctx = comercioChartElement.getContext("2d");
            new Chart(ctx, {
               type: "doughnut",
               data: comercioChartConfig,
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
         console.error("Dados de tarefas do setor inválidos:", resultado);
      }
   } catch (error) {
      console.error("Erro ao preencher gráfico de tarefas do Comércio:", error);
   }
}

// Função para o gráfico das tarefas do mês no segmento Supermercado
async function preencherGraficoSupermercadoMesAtual() {
   const supermercadoChartConfig = {
      labels: ["Pendente", "Atrasada", "Concluída"],
      datasets: [
         {
            label: "Tarefas do Supermercado no Mês",
            data: [0, 0, 0],
            backgroundColor: ["yellow", "red", "green"],
            hoverOffset: 4,
         },
      ],
   };

   try {
      const resultado = await window.electronAPI.obterTarefasSetor(userId);
      console.log("resultado setor:", resultado);

      // Verifique se o resultado é válido
      if (resultado.success && Array.isArray(resultado.tarefas)) {
         let pendentes = 0;
         let atrasadas = 0;
         let concluidas = 0;

         // Filtra e conta as tarefas com segmento "Supermercado" em cada status
         resultado.tarefas.forEach((tarefa) => {
            if (tarefa && tarefa.segmento === "Supermercado" && tarefa.status) {
               switch (tarefa.status) {
                  case "Pendente":
                     pendentes++;
                     break;
                  case "Atrasada":
                     atrasadas++;
                     break;
                  case "Concluída":
                     concluidas++;
                     break;
               }
            }
         });

         // Atualiza os dados do gráfico com os contadores
         supermercadoChartConfig.datasets[0].data = [
            pendentes,
            atrasadas,
            concluidas,
         ];

         const supermercadoChartElement =
            document.getElementById("supermercadoChart");
         const noChartMessage = document.querySelector(
            ".supermercado-content .no-chart-message"
         );

         // Verifica se há tarefas para exibir
         if (pendentes === 0 && atrasadas === 0 && concluidas === 0) {
            supermercadoChartElement.style.display = "none";
            noChartMessage.style.display = "block";
            return;
         } else {
            supermercadoChartElement.style.display = "block";
            noChartMessage.style.display = "none";

            const ctx = supermercadoChartElement.getContext("2d");
            new Chart(ctx, {
               type: "doughnut",
               data: supermercadoChartConfig,
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
         console.error("Dados de tarefas do setor inválidos:", resultado);
      }
   } catch (error) {
      console.error(
         "Erro ao preencher gráfico de tarefas do Supermercado:",
         error
      );
   }
}

// Função para o gráfico das tarefas do mês no segmento Indústria
async function preencherGraficoIndustriaMesAtual() {
   const industriaChartConfig = {
      labels: ["Pendente", "Atrasada", "Concluída"],
      datasets: [
         {
            label: "Tarefas da Indústria no Mês",
            data: [0, 0, 0],
            backgroundColor: ["yellow", "red", "green"],
            hoverOffset: 4,
         },
      ],
   };

   try {
      const resultado = await window.electronAPI.obterTarefasSetor(userId);
      console.log("resultado setor:", resultado);

      // Verifique se o resultado é válido
      if (resultado.success && Array.isArray(resultado.tarefas)) {
         let pendentes = 0;
         let atrasadas = 0;
         let concluidas = 0;

         // Filtra e conta as tarefas com segmento "Indústria" em cada status
         resultado.tarefas.forEach((tarefa) => {
            if (tarefa && tarefa.segmento === "Indústria" && tarefa.status) {
               switch (tarefa.status) {
                  case "Pendente":
                     pendentes++;
                     break;
                  case "Atrasada":
                     atrasadas++;
                     break;
                  case "Concluída":
                     concluidas++;
                     break;
               }
            }
         });

         // Atualiza os dados do gráfico com os contadores
         industriaChartConfig.datasets[0].data = [
            pendentes,
            atrasadas,
            concluidas,
         ];

         const industriaChartElement =
            document.getElementById("industriaChart");
         const noChartMessage = document.querySelector(
            ".industria-content .no-chart-message"
         );

         // Define o tamanho do canvas para 200x200 pixels
         industriaChartElement.style.width = "200px";
         industriaChartElement.style.height = "200px";

         // Verifica se há tarefas para exibir
         if (pendentes === 0 && atrasadas === 0 && concluidas === 0) {
            industriaChartElement.style.display = "none";
            noChartMessage.style.display = "block";
            return;
         } else {
            industriaChartElement.style.display = "block";
            noChartMessage.style.display = "none";

            const ctx = industriaChartElement.getContext("2d");
            new Chart(ctx, {
               type: "doughnut",
               data: industriaChartConfig,
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
         console.error("Dados de tarefas do setor inválidos:", resultado);
      }
   } catch (error) {
      console.error(
         "Erro ao preencher gráfico de tarefas da Indústria:",
         error
      );
   }
}

async function preencherGraficoTarefasAuxiliaresComercio() {
   const tarefasConcluidas = {};
   const tarefasTotal = {};

   try {
      const resultado = await window.electronAPI.obterTarefasAuxiliaresComercio(
         userId
      );
      console.log(
         "Resultado do servidor (tarefas auxiliares comércio):",
         resultado
      );

      if (resultado.success && Array.isArray(resultado.tarefas)) {
         // Filtra as tarefas pelo setor e segmento "Comércio"
         const tarefasComercio = resultado.tarefas.filter(
            (tarefa) => tarefa.segmento === "Comércio"
         );
         console.log("Tarefas filtradas (segmento Comércio):", tarefasComercio);

         if (tarefasComercio.length === 0) {
            console.log("Nenhuma tarefa encontrada com segmento 'Comércio'.");
         }

         tarefasComercio.forEach((tarefa) => {
            const responsavel = tarefa.responsavel;
            const responsavelId = responsavel.id;
            const nomeResponsavelFormatado = formatarNome(responsavel);

            // Inicializa contadores para cada auxiliar
            if (!tarefasTotal[responsavelId]) {
               tarefasTotal[responsavelId] = {
                  nome: nomeResponsavelFormatado,
                  count: 0,
               };
               tarefasConcluidas[responsavelId] = 0;
            }

            // Conta as tarefas totais e as concluídas por auxiliar
            tarefasTotal[responsavelId].count++;
            if (tarefa.status === "Concluída") {
               tarefasConcluidas[responsavelId]++;
            }
         });

         console.log("Tarefas totais por auxiliar:", tarefasTotal);
         console.log("Tarefas concluídas por auxiliar:", tarefasConcluidas);

         const auxiliaresComercioContent = document.getElementById(
            "auxiliaresComercioChart"
         );
         const noChartMessage = document.querySelector(".no-chart-message");

         // Verifica se há tarefas para exibir
         if (tarefasComercio.length === 0) {
            auxiliaresComercioContent.style.display = "none";
            noChartMessage.style.display = "block";
            return;
         } else {
            auxiliaresComercioContent.style.display = "block";
            noChartMessage.style.display = "none";

            const ctx = auxiliaresComercioContent.getContext("2d");
            const nomesAuxiliares = Object.values(tarefasTotal).map(
               (auxiliar) => auxiliar.nome
            );
            const dadosTarefasTotal = Object.values(tarefasTotal).map(
               (auxiliar) => auxiliar.count
            );
            const dadosTarefasConcluidas = Object.values(tarefasConcluidas);

            console.log("Nomes auxiliares:", nomesAuxiliares);
            console.log("Dados tarefas totais:", dadosTarefasTotal);
            console.log("Dados tarefas concluídas:", dadosTarefasConcluidas);

            // Configuração dos dados do gráfico
            const chartData = {
               labels: nomesAuxiliares,
               datasets: [
                  {
                     label: "Total de Tarefas",
                     data: dadosTarefasTotal,
                     backgroundColor: "lightgray",
                  },
                  {
                     label: "Tarefas Concluídas",
                     data: dadosTarefasConcluidas,
                     backgroundColor: "green",
                  },
               ],
            };

            // Criação do gráfico
            window.auxiliaresChartInstance = new Chart(ctx, {
               type: "bar",
               data: chartData,
               options: {
                  responsive: true,
                  indexAxis: "y",
                  scales: { x: { stacked: false }, y: { stacked: false } },
                  elements: { bar: { barThickness: 20 } },
                  plugins: {
                     legend: {
                        position: "top",
                        labels: { font: { size: 14, weight: "bold" } },
                     },
                     tooltip: {
                        callbacks: {
                           label: function (tooltipItem) {
                              const datasetLabel = tooltipItem.dataset.label;
                              const taskCount = tooltipItem.raw;
                              return datasetLabel === "Total de Tarefas"
                                 ? `Total de Tarefas: ${taskCount}`
                                 : `Tarefas Concluídas: ${taskCount}`;
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

// Função para o gráfico das tarefas dos analistas do setor no segmento "Comércio"
async function preencherGraficoTarefasAnalistasComercio() {
   const tarefasConcluidas = {};
   const tarefasTotal = {};

   try {
      const resultado = await window.electronAPI.obterTarefasAnalistasComercio(
         userId
      );
      console.log("resultado analistas comércio:", resultado);

      if (resultado.success && Array.isArray(resultado.tarefas)) {
         // Filtra as tarefas pelo setor, segmento "Comércio" e cargo "Analista"
         const tarefasComercio = resultado.tarefas.filter(
            (tarefa) =>
               tarefa.segmento === "Comércio" &&
               tarefa.responsavel.cargo === "Analista"
         );

         tarefasComercio.forEach((tarefa) => {
            const responsavel = tarefa.responsavel;
            const responsavelId = responsavel.id;
            const nomeResponsavelFormatado = formatarNome(responsavel);

            // Inicializa contadores para cada analista
            if (!tarefasTotal[responsavelId]) {
               tarefasTotal[responsavelId] = {
                  nome: nomeResponsavelFormatado,
                  count: 0,
               };
               tarefasConcluidas[responsavelId] = 0;
            }

            // Conta as tarefas totais e as concluídas por analista
            tarefasTotal[responsavelId].count++;
            if (tarefa.status === "Concluída") {
               tarefasConcluidas[responsavelId]++;
            }
         });

         const analistasComercioContent = document.getElementById(
            "analistasComercioChart"
         );
         const noChartMessage = document.querySelector(".no-chart-message");

         // Verifica se há tarefas para exibir
         if (tarefasComercio.length === 0) {
            analistasComercioContent.style.display = "none";
            noChartMessage.style.display = "block";
            return;
         } else {
            analistasComercioContent.style.display = "block";
            noChartMessage.style.display = "none";

            const ctx = analistasComercioContent.getContext("2d");
            const nomesAnalistas = Object.values(tarefasTotal).map(
               (analista) => analista.nome
            );
            const dadosTarefasTotal = Object.values(tarefasTotal).map(
               (analista) => analista.count
            );
            const dadosTarefasConcluidas = Object.values(tarefasConcluidas);

            // Configuração dos dados do gráfico
            const chartData = {
               labels: nomesAnalistas,
               datasets: [
                  {
                     label: "Total de Tarefas",
                     data: dadosTarefasTotal,
                     backgroundColor: "lightgray",
                  },
                  {
                     label: "Tarefas Concluídas",
                     data: dadosTarefasConcluidas,
                     backgroundColor: "green",
                  },
               ],
            };

            // Criação do gráfico
            window.analistasComercioChartInstance = new Chart(ctx, {
               type: "bar",
               data: chartData,
               options: {
                  responsive: true,
                  indexAxis: "y",
                  scales: { x: { stacked: false }, y: { stacked: false } },
                  elements: { bar: { barThickness: 20 } },
                  plugins: {
                     legend: {
                        position: "top",
                        labels: { font: { size: 14, weight: "bold" } },
                     },
                     tooltip: {
                        callbacks: {
                           label: function (tooltipItem) {
                              const datasetLabel = tooltipItem.dataset.label;
                              const taskCount = tooltipItem.raw;
                              return datasetLabel === "Total de Tarefas"
                                 ? `Total de Tarefas: ${taskCount}`
                                 : `Tarefas Concluídas: ${taskCount}`;
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

// Função para o gráfico das tarefas dos auxiliares do setor no segmento "Supermercado"
async function preencherGraficoTarefasAuxiliaresSupermercado() {
   const tarefasConcluidas = {};
   const tarefasTotal = {};

   try {
      const resultado =
         await window.electronAPI.obterTarefasAuxiliaresSupermercado(userId);
      console.log("resultado auxiliares supermercado:", resultado);

      if (resultado.success && Array.isArray(resultado.tarefas)) {
         // Filtra as tarefas pelo setor, segmento "Supermercado" e cargo "Auxiliar"
         const tarefasSupermercado = resultado.tarefas.filter(
            (tarefa) =>
               tarefa.segmento === "Supermercado" &&
               tarefa.responsavel.cargo === "Auxiliar"
         );

         tarefasSupermercado.forEach((tarefa) => {
            const responsavel = tarefa.responsavel;
            const responsavelId = responsavel.id;
            const nomeResponsavelFormatado = formatarNome(responsavel);

            // Inicializa contadores para cada auxiliar
            if (!tarefasTotal[responsavelId]) {
               tarefasTotal[responsavelId] = {
                  nome: nomeResponsavelFormatado,
                  count: 0,
               };
               tarefasConcluidas[responsavelId] = 0;
            }

            // Conta as tarefas totais e as concluídas por auxiliar
            tarefasTotal[responsavelId].count++;
            if (tarefa.status === "Concluída") {
               tarefasConcluidas[responsavelId]++;
            }
         });

         const auxiliaresSupermercadoContent = document.getElementById(
            "auxiliaresSupermercadoChart"
         );
         const noChartMessage = document.querySelector(".no-chart-message");

         // Verifica se há tarefas para exibir
         if (tarefasSupermercado.length === 0) {
            auxiliaresSupermercadoContent.style.display = "none";
            noChartMessage.style.display = "block";
            return;
         } else {
            auxiliaresSupermercadoContent.style.display = "block";
            noChartMessage.style.display = "none";

            const ctx = auxiliaresSupermercadoContent.getContext("2d");
            const nomesAuxiliares = Object.values(tarefasTotal).map(
               (auxiliar) => auxiliar.nome
            );
            const dadosTarefasTotal = Object.values(tarefasTotal).map(
               (auxiliar) => auxiliar.count
            );
            const dadosTarefasConcluidas = Object.values(tarefasConcluidas);

            // Configuração dos dados do gráfico
            const chartData = {
               labels: nomesAuxiliares,
               datasets: [
                  {
                     label: "Total de Tarefas",
                     data: dadosTarefasTotal,
                     backgroundColor: "lightgray",
                  },
                  {
                     label: "Tarefas Concluídas",
                     data: dadosTarefasConcluidas,
                     backgroundColor: "green",
                  },
               ],
            };

            // Criação do gráfico
            window.auxiliaresChartInstance = new Chart(ctx, {
               type: "bar",
               data: chartData,
               options: {
                  responsive: true,
                  indexAxis: "y",
                  scales: { x: { stacked: false }, y: { stacked: false } },
                  elements: { bar: { barThickness: 20 } },
                  plugins: {
                     legend: {
                        position: "top",
                        labels: { font: { size: 14, weight: "bold" } },
                     },
                     tooltip: {
                        callbacks: {
                           label: function (tooltipItem) {
                              const datasetLabel = tooltipItem.dataset.label;
                              const taskCount = tooltipItem.raw;
                              return datasetLabel === "Total de Tarefas"
                                 ? `Total de Tarefas: ${taskCount}`
                                 : `Tarefas Concluídas: ${taskCount}`;
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

// Função para o gráfico das tarefas dos analistas do setor no segmento "Supermercado"
async function preencherGraficoTarefasAnalistasSupermercado() {
   const tarefasConcluidas = {};
   const tarefasTotal = {};

   try {
      const resultado =
         await window.electronAPI.obterTarefasAnalistasSupermercado(userId);
      console.log("resultado analistas supermercado:", resultado);

      if (resultado.success && Array.isArray(resultado.tarefas)) {
         // Filtra as tarefas pelo setor, segmento "Supermercado" e cargo "Analista"
         const tarefasSupermercado = resultado.tarefas.filter(
            (tarefa) =>
               tarefa.segmento === "Supermercado" &&
               tarefa.responsavel.cargo === "Analista"
         );

         tarefasSupermercado.forEach((tarefa) => {
            const responsavel = tarefa.responsavel;
            const responsavelId = responsavel.id;
            const nomeResponsavelFormatado = formatarNome(responsavel);

            // Inicializa contadores para cada analista
            if (!tarefasTotal[responsavelId]) {
               tarefasTotal[responsavelId] = {
                  nome: nomeResponsavelFormatado,
                  count: 0,
               };
               tarefasConcluidas[responsavelId] = 0;
            }

            // Conta as tarefas totais e as concluídas por analista
            tarefasTotal[responsavelId].count++;
            if (tarefa.status === "Concluída") {
               tarefasConcluidas[responsavelId]++;
            }
         });

         const analistasSupermercadoContent = document.getElementById(
            "analistasSupermercadoChart"
         );
         const noChartMessage = document.querySelector(".no-chart-message");

         // Verifica se há tarefas para exibir
         if (tarefasSupermercado.length === 0) {
            analistasSupermercadoContent.style.display = "none";
            noChartMessage.style.display = "block";
            return;
         } else {
            analistasSupermercadoContent.style.display = "block";
            noChartMessage.style.display = "none";

            const ctx = analistasSupermercadoContent.getContext("2d");
            const nomesAnalistas = Object.values(tarefasTotal).map(
               (analista) => analista.nome
            );
            const dadosTarefasTotal = Object.values(tarefasTotal).map(
               (analista) => analista.count
            );
            const dadosTarefasConcluidas = Object.values(tarefasConcluidas);

            // Configuração dos dados do gráfico
            const chartData = {
               labels: nomesAnalistas,
               datasets: [
                  {
                     label: "Total de Tarefas",
                     data: dadosTarefasTotal,
                     backgroundColor: "lightgray",
                  },
                  {
                     label: "Tarefas Concluídas",
                     data: dadosTarefasConcluidas,
                     backgroundColor: "green",
                  },
               ],
            };

            // Criação do gráfico
            window.analistasChartInstance = new Chart(ctx, {
               type: "bar",
               data: chartData,
               options: {
                  responsive: true,
                  indexAxis: "y",
                  scales: { x: { stacked: false }, y: { stacked: false } },
                  elements: { bar: { barThickness: 20 } },
                  plugins: {
                     legend: {
                        position: "top",
                        labels: { font: { size: 14, weight: "bold" } },
                     },
                     tooltip: {
                        callbacks: {
                           label: function (tooltipItem) {
                              const datasetLabel = tooltipItem.dataset.label;
                              const taskCount = tooltipItem.raw;
                              return datasetLabel === "Total de Tarefas"
                                 ? `Total de Tarefas: ${taskCount}`
                                 : `Tarefas Concluídas: ${taskCount}`;
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

// Função para o gráfico das tarefas dos auxiliares do setor no segmento "Indústria"
async function preencherGraficoTarefasAuxiliaresIndustria() {
   const tarefasConcluidas = {};
   const tarefasTotal = {};

   try {
      const resultado =
         await window.electronAPI.obterTarefasAuxiliaresIndustria(userId);
      console.log("resultado auxiliares indústria:", resultado);

      if (resultado.success && Array.isArray(resultado.tarefas)) {
         // Filtra as tarefas pelo setor e segmento "Indústria"
         const tarefasIndustria = resultado.tarefas.filter(
            (tarefa) => tarefa.segmento === "Indústria"
         );

         tarefasIndustria.forEach((tarefa) => {
            const responsavel = tarefa.responsavel;
            const responsavelId = responsavel.id;
            const nomeResponsavelFormatado = formatarNome(responsavel);

            // Inicializa contadores para cada auxiliar
            if (!tarefasTotal[responsavelId]) {
               tarefasTotal[responsavelId] = {
                  nome: nomeResponsavelFormatado,
                  count: 0,
               };
               tarefasConcluidas[responsavelId] = 0;
            }

            // Conta as tarefas totais e as concluídas por auxiliar
            tarefasTotal[responsavelId].count++;
            if (tarefa.status === "Concluída") {
               tarefasConcluidas[responsavelId]++;
            }
         });

         const auxiliaresIndustriaContent = document.getElementById(
            "auxiliaresIndustriaChart"
         );
         const noChartMessage = document.querySelector(".no-chart-message");

         // Verifica se há tarefas para exibir
         if (tarefasIndustria.length === 0) {
            auxiliaresIndustriaContent.style.display = "none";
            noChartMessage.style.display = "block";
            return;
         } else {
            auxiliaresIndustriaContent.style.display = "block";
            noChartMessage.style.display = "none";

            const ctx = auxiliaresIndustriaContent.getContext("2d");
            const nomesAuxiliares = Object.values(tarefasTotal).map(
               (auxiliar) => auxiliar.nome
            );
            const dadosTarefasTotal = Object.values(tarefasTotal).map(
               (auxiliar) => auxiliar.count
            );
            const dadosTarefasConcluidas = Object.values(tarefasConcluidas);

            // Configuração dos dados do gráfico
            const chartData = {
               labels: nomesAuxiliares,
               datasets: [
                  {
                     label: "Total de Tarefas",
                     data: dadosTarefasTotal,
                     backgroundColor: "lightgray",
                  },
                  {
                     label: "Tarefas Concluídas",
                     data: dadosTarefasConcluidas,
                     backgroundColor: "green",
                  },
               ],
            };

            // Criação do gráfico
            window.auxiliaresChartInstance = new Chart(ctx, {
               type: "bar",
               data: chartData,
               options: {
                  responsive: true,
                  indexAxis: "y",
                  scales: { x: { stacked: false }, y: { stacked: false } },
                  elements: { bar: { barThickness: 20 } },
                  plugins: {
                     legend: {
                        position: "top",
                        labels: { font: { size: 14, weight: "bold" } },
                     },
                     tooltip: {
                        callbacks: {
                           label: function (tooltipItem) {
                              const datasetLabel = tooltipItem.dataset.label;
                              const taskCount = tooltipItem.raw;
                              return datasetLabel === "Total de Tarefas"
                                 ? `Total de Tarefas: ${taskCount}`
                                 : `Tarefas Concluídas: ${taskCount}`;
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

// Função para o gráfico das tarefas dos analistas do setor no segmento "Indústria"
async function preencherGraficoTarefasAnalistasIndustria() {
   const tarefasConcluidas = {};
   const tarefasTotal = {};

   try {
      const resultado = await window.electronAPI.obterTarefasAnalistasIndustria(
         userId
      );
      console.log(
         "Resultado do servidor (tarefas analistas indústria):",
         resultado
      );

      if (resultado.success && Array.isArray(resultado.tarefas)) {
         // Filtra as tarefas pelo setor e segmento "Indústria"
         const tarefasIndustria = resultado.tarefas.filter(
            (tarefa) => tarefa.segmento === "Indústria"
         );
         console.log(
            "Tarefas filtradas (segmento Indústria):",
            tarefasIndustria
         );

         if (tarefasIndustria.length === 0) {
            console.log("Nenhuma tarefa encontrada com segmento 'Indústria'.");
         }

         tarefasIndustria.forEach((tarefa) => {
            const responsavel = tarefa.responsavel;
            const responsavelId = responsavel.id;
            const nomeResponsavelFormatado = formatarNome(responsavel);

            // Inicializa contadores para cada analista
            if (!tarefasTotal[responsavelId]) {
               tarefasTotal[responsavelId] = {
                  nome: nomeResponsavelFormatado,
                  count: 0,
               };
               tarefasConcluidas[responsavelId] = 0;
            }

            // Conta as tarefas totais e as concluídas por analista
            tarefasTotal[responsavelId].count++;
            if (tarefa.status === "Concluída") {
               tarefasConcluidas[responsavelId]++;
            }
         });

         console.log("Tarefas totais por analista:", tarefasTotal);
         console.log("Tarefas concluídas por analista:", tarefasConcluidas);

         const analistasIndustriaContent = document.getElementById(
            "analistasIndustriaChart"
         );
         const noChartMessage = document.querySelector(".no-chart-message");

         // Verifica se há tarefas para exibir
         if (tarefasIndustria.length === 0) {
            analistasIndustriaContent.style.display = "none";
            noChartMessage.style.display = "block";
            return;
         } else {
            analistasIndustriaContent.style.display = "block";
            noChartMessage.style.display = "none";

            const ctx = analistasIndustriaContent.getContext("2d");
            const nomesAnalistas = Object.values(tarefasTotal).map(
               (analista) => analista.nome
            );
            const dadosTarefasTotal = Object.values(tarefasTotal).map(
               (analista) => analista.count
            );
            const dadosTarefasConcluidas = Object.values(tarefasConcluidas);

            console.log("Nomes analistas:", nomesAnalistas);
            console.log("Dados tarefas totais:", dadosTarefasTotal);
            console.log("Dados tarefas concluídas:", dadosTarefasConcluidas);

            // Configuração dos dados do gráfico
            const chartData = {
               labels: nomesAnalistas,
               datasets: [
                  {
                     label: "Total de Tarefas",
                     data: dadosTarefasTotal,
                     backgroundColor: "lightgray",
                  },
                  {
                     label: "Tarefas Concluídas",
                     data: dadosTarefasConcluidas,
                     backgroundColor: "green",
                  },
               ],
            };

            // Criação do gráfico
            window.analistasChartInstance = new Chart(ctx, {
               type: "bar",
               data: chartData,
               options: {
                  responsive: true,
                  indexAxis: "y",
                  scales: { x: { stacked: false }, y: { stacked: false } },
                  elements: { bar: { barThickness: 20 } },
                  plugins: {
                     legend: {
                        position: "top",
                        labels: { font: { size: 14, weight: "bold" } },
                     },
                     tooltip: {
                        callbacks: {
                           label: function (tooltipItem) {
                              const datasetLabel = tooltipItem.dataset.label;
                              const taskCount = tooltipItem.raw;
                              return datasetLabel === "Total de Tarefas"
                                 ? `Total de Tarefas: ${taskCount}`
                                 : `Tarefas Concluídas: ${taskCount}`;
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
   } catch (error) {
      console.error("Erro ao atualizar gráficos:", error);
   }
}

// Função para atualizar os gráficos admin no Dashboard
async function atualizarGraficosAdmin() {
   try {
      await preencherGraficoTarefasDiaAtual();

      await preencherGraficoTarefasMesAtual();

      await preencherGraficoProgresso();

      await preencherGraficoTarefasSetorMesAtual();

      await preencherGraficoComercioMesAtual();

      await preencherGraficoSupermercadoMesAtual();

      await preencherGraficoIndustriaMesAtual();

      await preencherGraficoTarefasAuxiliaresComercio();

      await preencherGraficoTarefasAnalistasComercio();

      await preencherGraficoTarefasAuxiliaresSupermercado();

      await preencherGraficoTarefasAnalistasSupermercado();

      await preencherGraficoTarefasAuxiliaresIndustria();

      await preencherGraficoTarefasAnalistasIndustria();
   } catch (error) {
      console.error("Erro ao atualizar gráficos:", error);
   }
}
