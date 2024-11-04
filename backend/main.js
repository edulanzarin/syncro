// Importa módulos do Electron e outras bibliotecas
const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const { execFile } = require("child_process");

let mainWindow;

// Função para criar a janela principal da aplicação
function createWindow() {
   mainWindow = new BrowserWindow({
      width: 800,
      height: 600,
      icon: path.join(__dirname, "../src/images/logo.png"),
      webPreferences: {
         preload: path.join(__dirname, "preload.js"),
         contextIsolation: true,
         enableRemoteModule: false,
         nodeIntegration: false,
      },
      autoHideMenuBar: true,
   });
   mainWindow.loadFile("src/dashboard/dashboard.html");
   mainWindow.maximize();
}

// Evento quando a aplicação está pronta
app.on("ready", createWindow);

// Função para executar uma consulta SQL personalizada
ipcMain.handle(
   "executar_consulta_sql",
   async (event, sqlQuery, parametros = []) => {
      return new Promise((resolve, reject) => {
         const args = [
            "executar_consulta_sql",
            sqlQuery,
            JSON.stringify(parametros),
         ];

         const pythonProcess = execFile("python3", [
            path.join(__dirname, "main.py"),
            ...args,
         ]);

         let output = "";

         pythonProcess.stdout.on("data", (data) => {
            output += data.toString();
            console.log(
               "Dados recebidos do Python (executar_consulta_sql):",
               data.toString()
            );
         });

         pythonProcess.stderr.on("data", (data) => {
            reject(`Erro ao executar consulta SQL: ${data}`);
         });

         pythonProcess.on("close", (code) => {
            if (code !== 0) {
               return reject(`O processo Python saiu com o código: ${code}`);
            }
            try {
               const result = JSON.parse(output.trim());
               resolve(result);
            } catch (error) {
               reject(`Erro ao analisar a resposta: ${error}`);
            }
         });
      });
   }
);

// Função para verificar login
ipcMain.handle("login", async (event, email, senha) => {
   return new Promise((resolve, reject) => {
      const pythonProcess = execFile("python3", [
         path.join(__dirname, "main.py"),
         "login",
         email,
         senha,
      ]);

      let output = "";

      pythonProcess.stdout.on("data", (data) => {
         output += data.toString();
         console.log("Dados recebidos do Python (login):", data.toString());
      });

      pythonProcess.stderr.on("data", (data) => {
         reject(`Erro ao verificar login: ${data}`);
      });

      pythonProcess.on("close", (code) => {
         if (code !== 0) {
            return reject(`O processo Python saiu com o código: ${code}`);
         }
         try {
            const result = JSON.parse(output.trim());
            resolve(result);
         } catch (error) {
            reject(`Erro ao analisar a resposta: ${error}`);
         }
      });
   });
});

// Função para registrar novo usuário
ipcMain.handle(
   "register",
   async (event, nome, cargo, setor, segmento, email, senha) => {
      return new Promise((resolve, reject) => {
         const args = ["register", nome, cargo, setor, segmento, email, senha];

         const pythonProcess = execFile("python3", [
            path.join(__dirname, "main.py"),
            ...args,
         ]);

         let output = "";

         pythonProcess.stdout.on("data", (data) => {
            output += data.toString();
            console.log(
               "Dados recebidos do Python: (register)",
               data.toString()
            );
         });

         pythonProcess.stderr.on("data", (data) => {
            reject(`Erro ao registrar usuário: ${data}`);
         });

         pythonProcess.on("close", (code) => {
            if (code !== 0) {
               return reject(`O processo Python saiu com o código: ${code}`);
            }
            try {
               const result = JSON.parse(output.trim());
               resolve(result);
            } catch (error) {
               reject(`Erro ao analisar a resposta: ${error}`);
            }
         });
      });
   }
);

// Função para obter dados do usuário
ipcMain.handle("obter_dados_usuario", async (event, id_usuario) => {
   return new Promise((resolve, reject) => {
      const pythonProcess = execFile("python3", [
         path.join(__dirname, "main.py"),
         "obter_dados_usuario",
         id_usuario,
      ]);

      let output = "";

      pythonProcess.stdout.on("data", (data) => {
         output += data.toString();
         console.log(
            "Dados recebidos do Python (obter_dados_usuario):",
            data.toString()
         );
      });

      pythonProcess.stderr.on("data", (data) => {
         reject(`Erro ao obter dados do usuário: ${data}`);
      });

      pythonProcess.on("close", (code) => {
         if (code !== 0) {
            return reject(`O processo Python saiu com o código: ${code}`);
         }
         try {
            const result = JSON.parse(output.trim());
            resolve(result);
         } catch (error) {
            reject(`Erro ao analisar a resposta: ${error}`);
         }
      });
   });
});

// Função para atualizar os dados do usuário
ipcMain.handle(
   "atualizar_dados_usuario",
   async (
      event,
      id_usuario,
      nome,
      cargo,
      setor,
      segmento,
      email,
      senha,
      foto
   ) => {
      return new Promise((resolve, reject) => {
         // Cria o comando a ser executado
         const pythonProcess = execFile("python3", [
            path.join(__dirname, "main.py"),
            "atualizar_dados_usuario",
            id_usuario,
            nome,
            cargo,
            setor,
            segmento,
            email,
            senha,
            foto || "",
         ]);

         let output = "";

         pythonProcess.stdout.on("data", (data) => {
            output += data.toString();
            console.log(
               "Dados recebidos do Python (atualizar_dados_usuario):",
               data.toString()
            );
         });

         pythonProcess.stderr.on("data", (data) => {
            reject(`Erro ao atualizar dados do usuário: ${data}`);
         });

         pythonProcess.on("close", (code) => {
            if (code !== 0) {
               return reject(`O processo Python saiu com o código: ${code}`);
            }
            try {
               const result = JSON.parse(output.trim());
               resolve(result);
            } catch (error) {
               reject(`Erro ao analisar a resposta: ${error}`);
            }
         });
      });
   }
);

// Função para obter tarefas do usuário
ipcMain.handle("obter_tarefas_usuario", async (event, id_usuario) => {
   return new Promise((resolve, reject) => {
      const pythonProcess = execFile("python3", [
         path.join(__dirname, "main.py"),
         "obter_tarefas_usuario",
         id_usuario,
      ]);

      let output = "";

      pythonProcess.stdout.on("data", (data) => {
         output += data.toString();
         console.log(
            "Dados recebidos do Python (obter_tarefas_usuario):",
            data.toString()
         );
      });

      pythonProcess.stderr.on("data", (data) => {
         reject(`Erro ao obter tarefas: ${data}`);
      });

      pythonProcess.on("close", (code) => {
         if (code !== 0) {
            return reject(`O processo Python saiu com o código: ${code}`);
         }
         try {
            const result = JSON.parse(output.trim());
            resolve(result);
         } catch (error) {
            reject(`Erro ao analisar a resposta: ${error}`);
         }
      });
   });
});

// Função para obter tarefas do usuário com prazo para o dia atual
ipcMain.handle("obter_tarefas_usuario_dia_atual", async (event, id_usuario) => {
   return new Promise((resolve, reject) => {
      const pythonProcess = execFile("python3", [
         path.join(__dirname, "main.py"),
         "obter_tarefas_usuario_dia_atual",
         id_usuario,
      ]);

      let output = "";

      pythonProcess.stdout.on("data", (data) => {
         output += data.toString();
         console.log(
            "Dados recebidos do Python (obter_tarefas_usuario_dia_atual):",
            data.toString()
         );
      });

      pythonProcess.stderr.on("data", (data) => {
         reject(`Erro ao obter tarefas: ${data}`);
      });

      pythonProcess.on("close", (code) => {
         if (code !== 0) {
            return reject(`O processo Python saiu com o código: ${code}`);
         }
         try {
            const result = JSON.parse(output.trim());
            resolve(result);
         } catch (error) {
            reject(`Erro ao analisar a resposta: ${error}`);
         }
      });
   });
});

// Função para obter tarefas da equipe
ipcMain.handle("obter_tarefas_equipe", async (event, id_usuario) => {
   return new Promise((resolve, reject) => {
      const pythonProcess = execFile("python3", [
         path.join(__dirname, "main.py"),
         "obter_tarefas_equipe",
         id_usuario,
      ]);

      let output = "";

      pythonProcess.stdout.on("data", (data) => {
         output += data.toString();
         console.log(
            "Dados recebidos do Python (obter_tarefas_equipe):",
            data.toString()
         );
      });

      pythonProcess.stderr.on("data", (data) => {
         reject(`Erro ao obter tarefas da equipe: ${data}`);
      });

      pythonProcess.on("close", (code) => {
         if (code !== 0) {
            return reject(`O processo Python saiu com o código: ${code}`);
         }
         try {
            const result = JSON.parse(output.trim());
            resolve(result);
         } catch (error) {
            reject(`Erro ao analisar a resposta: ${error}`);
         }
      });
   });
});

// Função para obter tarefas do usuário com prazo para o dia atual
ipcMain.handle("obter_tarefas_equipe_dia_atual", async (event, id_usuario) => {
   return new Promise((resolve, reject) => {
      const pythonProcess = execFile("python3", [
         path.join(__dirname, "main.py"),
         "obter_tarefas_equipe_dia_atual",
         id_usuario,
      ]);

      let output = "";

      pythonProcess.stdout.on("data", (data) => {
         output += data.toString();
         console.log(
            "Dados recebidos do Python (obter_tarefas_equipe_dia_atual):",
            data.toString()
         );
      });

      pythonProcess.stderr.on("data", (data) => {
         reject(`Erro ao obter tarefas: ${data}`);
      });

      pythonProcess.on("close", (code) => {
         if (code !== 0) {
            return reject(`O processo Python saiu com o código: ${code}`);
         }
         try {
            const result = JSON.parse(output.trim());
            resolve(result);
         } catch (error) {
            reject(`Erro ao analisar a resposta: ${error}`);
         }
      });
   });
});

// Função para obter tarefas da equipe
ipcMain.handle("obter_tarefas_auxiliares_equipe", async (event, id_usuario) => {
   return new Promise((resolve, reject) => {
      const pythonProcess = execFile("python3", [
         path.join(__dirname, "main.py"),
         "obter_tarefas_auxiliares_equipe",
         id_usuario,
      ]);

      let output = "";

      pythonProcess.stdout.on("data", (data) => {
         output += data.toString();
         console.log(
            "Dados recebidos do Python (obter_tarefas_auxiliares_equipe):",
            data.toString()
         );
      });

      pythonProcess.stderr.on("data", (data) => {
         reject(`Erro ao obter tarefas da equipe: ${data}`);
      });

      pythonProcess.on("close", (code) => {
         if (code !== 0) {
            return reject(`O processo Python saiu com o código: ${code}`);
         }
         try {
            const result = JSON.parse(output.trim());
            resolve(result);
         } catch (error) {
            reject(`Erro ao analisar a resposta: ${error}`);
         }
      });
   });
});

// Função para obter tarefas da equipe
ipcMain.handle("obter_tarefas_analistas_equipe", async (event, id_usuario) => {
   return new Promise((resolve, reject) => {
      const pythonProcess = execFile("python3", [
         path.join(__dirname, "main.py"),
         "obter_tarefas_analistas_equipe",
         id_usuario,
      ]);

      let output = "";

      pythonProcess.stdout.on("data", (data) => {
         output += data.toString();
         console.log(
            "Dados recebidos do Python (obter_tarefas_analistas_equipe):",
            data.toString()
         );
      });

      pythonProcess.stderr.on("data", (data) => {
         reject(`Erro ao obter tarefas da equipe: ${data}`);
      });

      pythonProcess.on("close", (code) => {
         if (code !== 0) {
            return reject(`O processo Python saiu com o código: ${code}`);
         }
         try {
            const result = JSON.parse(output.trim());
            resolve(result);
         } catch (error) {
            reject(`Erro ao analisar a resposta: ${error}`);
         }
      });
   });
});

// Função para verificar tarefas atrasadas
ipcMain.handle("verificar_tarefas_atrasadas", async (event, id_usuario) => {
   return new Promise((resolve, reject) => {
      const pythonProcess = execFile("python3", [
         path.join(__dirname, "main.py"),
         "verificar_tarefas_atrasadas",
         id_usuario,
      ]);

      let output = "";

      pythonProcess.stdout.on("data", (data) => {
         output += data.toString();
         console.log(
            "Dados recebidos do Python (verificar_tarefas_atrasadas):",
            data.toString()
         );
      });

      pythonProcess.stderr.on("data", (data) => {
         reject(`Erro ao atualizar tarefas: ${data}`);
      });

      pythonProcess.on("close", (code) => {
         if (code !== 0) {
            return reject(`O processo Python saiu com o código: ${code}`);
         }
         try {
            const result = JSON.parse(output.trim());
            resolve(result);
         } catch (error) {
            reject(`Erro ao analisar a resposta: ${error}`);
         }
      });
   });
});

// Função para registrar alteração de status
ipcMain.handle(
   "registrar_alteracao_status",
   async (event, id_tarefa, status_novo) => {
      return new Promise((resolve, reject) => {
         const pythonProcess = execFile("python3", [
            path.join(__dirname, "main.py"),
            "login",
            email,
            senha,
         ]);

         let output = "";

         pythonProcess.stdout.on("data", (data) => {
            output += data.toString();
            console.log(
               "Dados recebidos do Python (registrar_alteracao_status):",
               data.toString()
            );
         });

         pythonProcess.stderr.on("data", (data) => {
            reject(`Erro ao registrar alteração: ${data}`);
         });

         pythonProcess.on("close", (code) => {
            if (code !== 0) {
               return reject(`O processo Python saiu com o código: ${code}`);
            }
            try {
               const result = JSON.parse(output.trim());
               resolve(result);
            } catch (error) {
               reject(`Erro ao analisar a resposta: ${error}`);
            }
         });
      });
   }
);
