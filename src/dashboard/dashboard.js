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
            <p>Visão geral do seu <span id="user-name">Dia</span></p>
            <p class="caption">
               Confira um resumo das atividades e desempenho do dia.
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
            <p>Visão geral do seu <span id="user-name">Mês</span></p>
            <p class="caption">
               Confira um resumo das atividades e desempenho do mês.
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
            <p> Visão geral do seu <span id="user-name">Progresso</span></p>
            <p class="caption">
               Confira um resumo do progresso do mês.
            </p>
         </div>
         <canvas id="progressChart" class="chart"></canvas>
         <div class="no-chart-message" style="display:none;">
            <p>Não há tarefas para o mês.</p>
            <img src="../images/empty.gif" alt="Sem tarefas" />
         </div>
      </div>
   `;

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
            <div class="dashboard-card welcome-card">${welcomeContent}</div>
            <div id="today-info" class="dashboard-card">${data.todayInfo}</div>
            <div id="month-info" class="dashboard-card">${data.monthInfo}</div>
            <div id="progress-info" class="dashboard-card">${data.progressInfo}</div>
        `;
         break;
      case "admin":
         dashboardHTML = `
            <div class="dashboard-card welcome-card">${welcomeContent}</div>
            <div id="today-info" class="dashboard-card">${data.todayInfo}</div>
            <div id="month-info" class="dashboard-card">${data.monthInfo}</div>
            <div id="progress-info" class="dashboard-card">${data.progressInfo}</div>
        `;
         break;
      default:
         return "";
   }

   // Adiciona o HTML ao contêiner .dashboard-container
   dashboardContent.innerHTML = dashboardHTML;
   atualizarGraficos();
}

// Chama a função principal para criar o dashboard
createDashboard("user", userInfo);
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
      console.log("resultado:", resultado);

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

// Função para atualizar os gráficos no Dashboard
async function atualizarGraficos() {
   try {
      await preencherGraficoTarefasDiaAtual();

      await preencherGraficoTarefasMesAtual();

      await preencherGraficoProgresso();
   } catch (error) {
      console.error("Erro ao atualizar gráficos:", error);
   }
}
