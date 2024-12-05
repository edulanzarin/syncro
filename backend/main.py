import sqlite3
import os
import sys
import json
import base64
import re
from datetime import datetime

# Caminho para o diretório do banco de dados
db_directory = '/home/eduardo/Documentos/Databases'
db_name = 'nex.db'
db_path = os.path.join(db_directory, db_name)

# Função para conectar ao banco de dados
def conectar_db():
    return sqlite3.connect(db_path)

# Função para executar SQL do front
def executar_consulta_sql(sql_query):
    try:
        # Conecta ao banco de dados
        connection = conectar_db()
        cursor = connection.cursor()

        # Extrai os parâmetros da consulta, se existirem
        valores = re.findall(r'\?(\d+)', sql_query)  

        # Realiza a execução da consulta
        cursor.execute(sql_query, valores)

        # Obtém os resultados se for uma consulta de seleção
        if sql_query.strip().upper().startswith("SELECT"):
            colunas = [desc[0] for desc in cursor.description]
            dados = []

            # Itera sobre as linhas de resultados
            for linha in cursor.fetchall():
                linha_dados = dict(zip(colunas, linha))
                
                # Verifica se a coluna 'foto' está presente e é um BLOB
                if 'foto' in linha_dados and linha_dados['foto'] is not None:
                    try:
                        # Converte BLOB para Base64 e pega os primeiros 30 caracteres
                        foto_base64 = base64.b64encode(linha_dados['foto']).decode('utf-8')
                        linha_dados['foto'] = foto_base64[:30] + "..."  
                    except Exception:
                        linha_dados['foto'] = None  
                
                dados.append(linha_dados)

            result = {
                "success": True,
                "dados": dados
            }
        else:
            connection.commit()
            result = {
                "success": True,
                "message": "Consulta executada com sucesso."
            }
    
    except Exception as e:
        result = {
            "success": False,
            "message": str(e)
        }
    
    finally:
        # Fecha a conexão com o banco de dados
        cursor.close()
        connection.close()
    
    return result

# Função para verificar login e retornar dados do usuário
def login(email, senha):
    connection = conectar_db()
    cursor = connection.cursor()
    
    query = "SELECT * FROM usuarios WHERE email = ? AND senha = ?;"
    cursor.execute(query, (email, senha))
    usuario = cursor.fetchone()
    
    cursor.close()
    connection.close()
    
    if usuario:
        user_data = {
            "id": usuario[0],  
            "nome": usuario[1],  
            "cargo": usuario[2],  
            "setor": usuario[3],  
            "segmento": usuario[4],  
            "email": usuario[5],  
            "foto": None  
        }
        
        # Transformar a imagem BLOB em Base64
        if usuario[7] is not None:  
            try:
                foto_base64 = base64.b64encode(usuario[7]).decode('utf-8')  
                user_data["foto"] = f"data:image/png;base64,{foto_base64}"  
            except Exception:
                user_data["foto"] = None  

        result = {
            "success": True, 
            "message": "Login realizado com sucesso!", 
            "user": user_data
        }
    else:
        result = {"success": False, "message": "Email ou senha incorretos."}
    
    return result

# Função para registrar usuário
def register(nome, cargo, setor, segmento, email, senha):
    connection = conectar_db()
    cursor = connection.cursor()

    # Verificar se o email já existe no banco de dados
    query_check_email = "SELECT * FROM usuarios WHERE email = ?;"
    cursor.execute(query_check_email, (email,))
    existing_user = cursor.fetchone()

    if existing_user:
        result = {"success": False, "message": "O email já está cadastrado."}
    else:
        # Insere o novo usuário
        query_insert_user = """
        INSERT INTO usuarios (nome, cargo, setor, segmento, email, senha) 
        VALUES (?, ?, ?, ?, ?, ?);
        """
        
        # Se a foto é None, inserimos como NULL no banco
        cursor.execute(query_insert_user, (nome, cargo, setor, segmento, email, senha))
        connection.commit()
        
        result = {"success": True, "message": "Usuário cadastrado com sucesso!"}

    cursor.close()
    connection.close()
    
    return result

# Função para obter os dados do usuário
def obter_dados_usuario(id_usuario):
    connection = conectar_db()
    cursor = connection.cursor()
    
    # Query para obter os dados do usuário
    query_obter_dados_usuario = "SELECT * FROM usuarios WHERE id = ?;"
    cursor.execute(query_obter_dados_usuario, (id_usuario,))
    
    # Obter todos os dados e formatá-los como uma lista de dicionários
    dados = cursor.fetchall()
    dados_list = []
    
    for dado in dados:
        dado_data = {
            "id": dado[0],
            "nome": dado[1],
            "cargo": dado[2],
            "setor": dado[3],
            "segmento": dado[4],
            "email": dado[5],
            "senha": dado[6],
            "foto": dado[7]  
        }
        
        # Transformar a imagem BLOB em Base64
        if dado[7] is not None:  
            try:
                foto_base64 = base64.b64encode(dado[7]).decode('utf-8')  
                dado_data["foto"] = f"data:image/png;base64,{foto_base64}"  
            except Exception:
                dado_data["foto"] = None  
        
        dados_list.append(dado_data)
    
    cursor.close()
    connection.close()
    
    result = {
        "success": True,
        "dados_usuario": dados_list
    }
    
    return result

# Função para atualizar os dados do usuário
def atualizar_dados_usuario(id_usuario, nome, cargo, setor, segmento, email, senha, foto=None):
    connection = conectar_db()
    cursor = connection.cursor()

    try:
        if foto is not None:
            # Verifica se a foto está no formato base64
            if isinstance(foto, str):
                # Tenta decodificar a foto de base64
                try:
                    foto = base64.b64decode(foto)
                except Exception as e:
                    raise ValueError("Erro ao decodificar a foto: " + str(e))
            
            # Verifica se a foto agora é do tipo bytes
            if not isinstance(foto, bytes):
                raise ValueError("A foto não foi convertida para BLOB corretamente.")

            # Atualiza os dados do usuário no banco de dados, incluindo a foto
            query_atualizar = """
                UPDATE usuarios
                SET nome = ?, cargo = ?, setor = ?, segmento = ?, email = ?, senha = ?, foto = ?
                WHERE id = ?;
            """
            cursor.execute(query_atualizar, (nome, cargo, setor, segmento, email, senha, foto, id_usuario))
        else:
            # Atualiza os dados do usuário sem alterar a foto
            query_atualizar = """
                UPDATE usuarios
                SET nome = ?, cargo = ?, setor = ?, segmento = ?, email = ?, senha = ?
                WHERE id = ?;
            """
            cursor.execute(query_atualizar, (nome, cargo, setor, segmento, email, senha, id_usuario))

        # Confirma as alterações no banco de dados
        connection.commit()  
        result = {"success": True, "message": "Dados atualizados com sucesso."}

    except Exception as e:
        # Faz rollback em caso de erro
        connection.rollback()  
        result = {"success": False, "message": str(e)}

    finally:
        cursor.close()
        connection.close()
    
    return result

# Função para obter as tarefas de um usuário
def obter_tarefas_usuario(id_usuario):
    connection = conectar_db()
    cursor = connection.cursor()
    
    # Query para obter todas as informações das tarefas associadas ao id_usuario
    query_obter_tarefas = """
        SELECT t.id, t.titulo, t.descricao, t.prazo, t.status, t.setor, t.segmento
        FROM tarefas t
        INNER JOIN usuarios_tarefas ut ON ut.id_tarefa = t.id
        WHERE ut.id_usuario = ?;
    """
    
    # Executar a consulta com o id_usuario
    cursor.execute(query_obter_tarefas, (id_usuario,))
    
    # Obter todas as tarefas e formatá-las como uma lista de dicionários
    tarefas = cursor.fetchall()
    tarefas_list = []
    
    for tarefa in tarefas:
        tarefa_data = {
            "id": tarefa[0],
            "titulo": tarefa[1],
            "descricao": tarefa[2],
            "prazo": tarefa[3],
            "status": tarefa[4],
            "setor": tarefa[5],
            "segmento": tarefa[6]
        }
        tarefas_list.append(tarefa_data)
    
    cursor.close()
    connection.close()
    
    result = {
        "success": True,
        "tarefas": tarefas_list
    }
    
    return result

from datetime import datetime

def obter_tarefas_usuario_dia_atual(id_usuario):
    try:
        connection = conectar_db()
        cursor = connection.cursor()
        
        # Data e mês atual no formato AAAA-MM-DD e AAAA-MM
        data_atual = datetime.now().strftime('%Y-%m-%d')
        mes_atual = datetime.now().strftime('%Y-%m')
        
        # Query para obter as tarefas do usuário com prazo para o dia atual ou atrasadas do mês atual
        query_obter_tarefas = """
            SELECT t.id, t.titulo, t.descricao, t.prazo, t.status, t.setor, t.segmento
            FROM tarefas t
            INNER JOIN usuarios_tarefas ut ON ut.id_tarefa = t.id
            WHERE ut.id_usuario = ?
            AND (
                t.prazo = ? OR
                (t.prazo < ? AND strftime('%Y-%m', t.prazo) = ? AND t.status = 'Atrasada')
            );
        """
        
        # Executar a consulta com o id_usuario, data atual e mês atual
        cursor.execute(query_obter_tarefas, (id_usuario, data_atual, data_atual, mes_atual))
        
        # Obter todas as tarefas e formatá-las como uma lista de dicionários
        tarefas = cursor.fetchall()
        tarefas_list = []
        
        for tarefa in tarefas:
            tarefa_data = {
                "id": tarefa[0],
                "titulo": tarefa[1],
                "descricao": tarefa[2],
                "prazo": tarefa[3],
                "status": tarefa[4],
                "setor": tarefa[5],
                "segmento": tarefa[6]
            }
            tarefas_list.append(tarefa_data)
        
        cursor.close()
        connection.close()
        
        result = {
            "success": True,
            "tarefas": tarefas_list
        }
        
    except Exception as e:
        result = {
            "success": False,
            "message": str(e)
        }
    
    return result

# Função para obter as tarefas da equipe de um usuário
def obter_tarefas_equipe(id_usuario):
    response = {"success": False, "message": "Erro inesperado."}
    connection = None
    cursor = None

    try:
        connection = conectar_db()
        cursor = connection.cursor()
        
        # Query para obter o setor e segmento do usuário
        query_obter_usuario = "SELECT setor, segmento FROM usuarios WHERE id = ?;"
        cursor.execute(query_obter_usuario, (id_usuario,))
        
        # Obter o setor e segmento do usuário
        usuario = cursor.fetchone()
        if not usuario:
            response["message"] = "Usuário não encontrado."
            return response  
        
        setor, segmento = usuario
        
        query_obter_equipe = """
        SELECT id FROM usuarios 
        WHERE setor = ? AND segmento = ?;
        """
        cursor.execute(query_obter_equipe, (setor, segmento))
        usuarios_da_equipe = cursor.fetchall()
        
        if not usuarios_da_equipe:
            response["message"] = "Nenhum usuário encontrado na mesma equipe."
            return response  
        
        ids_equipe = [usuario[0] for usuario in usuarios_da_equipe]
        
        placeholders = ','.join('?' * len(ids_equipe))
        query_obter_tarefas = f"""
        SELECT t.id, t.titulo, t.descricao, t.prazo, t.status, t.setor, t.segmento
        FROM tarefas t
        INNER JOIN usuarios_tarefas ut ON ut.id_tarefa = t.id
        WHERE ut.id_usuario IN ({placeholders});
        """
        cursor.execute(query_obter_tarefas, ids_equipe)
        
        # Obter todas as tarefas e formatá-las como uma lista de dicionários
        tarefas = cursor.fetchall()
        tarefas_list = [
            {
                "id": tarefa[0],
                "titulo": tarefa[1],
                "descricao": tarefa[2],
                "prazo": tarefa[3],
                "status": tarefa[4],
                "setor": tarefa[5],
                "segmento": tarefa[6]
            }
            for tarefa in tarefas
        ]
        
        response = {
            "success": True,
            "tarefas": tarefas_list
        }
    
    except Exception as e:
        response = {
            "success": False,
            "message": str(e)  
        }
    
    finally:
        if cursor:
            cursor.close()
        if connection:
            connection.close()
        
    return response 

# Função para obter as tarefas da equipe de um usuário para o dia atual
def obter_tarefas_equipe_dia_atual(id_usuario):
    response = {"success": False, "message": "Erro inesperado."}
    connection = None
    cursor = None

    try:
        connection = conectar_db()
        cursor = connection.cursor()

        # Data e mês atual no formato AAAA-MM-DD e AAAA-MM
        data_atual = datetime.now().strftime('%Y-%m-%d')
        mes_atual = datetime.now().strftime('%Y-%m')

        # Query para obter o setor e segmento do usuário
        query_obter_usuario = "SELECT setor, segmento FROM usuarios WHERE id = ?;"
        cursor.execute(query_obter_usuario, (id_usuario,))

        # Obter o setor e segmento do usuário
        usuario = cursor.fetchone()
        if not usuario:
            response["message"] = "Usuário não encontrado."
            return response  

        setor, segmento = usuario

        # Query para obter os IDs dos usuários da mesma equipe
        query_obter_equipe = """
        SELECT id FROM usuarios 
        WHERE setor = ? AND segmento = ?;
        """
        cursor.execute(query_obter_equipe, (setor, segmento))
        usuarios_da_equipe = cursor.fetchall()

        if not usuarios_da_equipe:
            response["message"] = "Nenhum usuário encontrado na mesma equipe."
            return response  

        ids_equipe = [usuario[0] for usuario in usuarios_da_equipe]

        placeholders = ','.join('?' * len(ids_equipe))
        query_obter_tarefas = f"""
        SELECT t.id, t.titulo, t.descricao, t.prazo, t.status, t.setor, t.segmento
        FROM tarefas t
        INNER JOIN usuarios_tarefas ut ON ut.id_tarefa = t.id
        WHERE ut.id_usuario IN ({placeholders})
        AND (
            t.prazo = ? OR
            (t.prazo < ? AND strftime('%Y-%m', t.prazo) = ? AND t.status = 'Atrasada')
        );
        """
        
        # Executar a consulta com os IDs da equipe, a data atual e o mês atual
        cursor.execute(query_obter_tarefas, (*ids_equipe, data_atual, data_atual, mes_atual))

        # Obter todas as tarefas e formatá-las como uma lista de dicionários
        tarefas = cursor.fetchall()
        tarefas_list = [
            {
                "id": tarefa[0],
                "titulo": tarefa[1],
                "descricao": tarefa[2],
                "prazo": tarefa[3],
                "status": tarefa[4],
                "setor": tarefa[5],
                "segmento": tarefa[6]
            }
            for tarefa in tarefas
        ]

        response = {
            "success": True,
            "tarefas": tarefas_list
        }

    except Exception as e:
        response = {
            "success": False,
            "message": str(e)  
        }

    finally:
        if cursor:
            cursor.close()
        if connection:
            connection.close()
        
    return response

# Função para obter as tarefas da equipe de usuários com cargo "Auxiliar"
def obter_tarefas_auxiliares_equipe(id_usuario):
    response = {"success": False, "message": "Erro inesperado."}
    connection = None
    cursor = None

    try:
        connection = conectar_db()
        cursor = connection.cursor()
        
        # Query para obter o setor e segmento do usuário
        query_obter_usuario = "SELECT setor, segmento FROM usuarios WHERE id = ?;"
        cursor.execute(query_obter_usuario, (id_usuario,))
        
        # Obter o setor e segmento do usuário
        usuario = cursor.fetchone()
        if not usuario:
            response["message"] = "Usuário não encontrado."
            return response  
        
        setor, segmento = usuario
        
        # Query para obter os usuários com cargo "Auxiliar" na mesma equipe
        query_obter_equipe_auxiliares = """
        SELECT id, nome FROM usuarios 
        WHERE setor = ? AND segmento = ? AND cargo = 'Auxiliar';
        """
        cursor.execute(query_obter_equipe_auxiliares, (setor, segmento))
        usuarios_da_equipe = cursor.fetchall()
        
        if not usuarios_da_equipe:
            response["message"] = "Nenhum usuário com cargo 'Auxiliar' encontrado na mesma equipe."
            return response  
        
        ids_equipe_auxiliares = [usuario[0] for usuario in usuarios_da_equipe]
        nomes_equipe_auxiliares = {usuario[0]: usuario[1] for usuario in usuarios_da_equipe}  # Dicionário com id como chave e nome como valor

        placeholders = ','.join('?' * len(ids_equipe_auxiliares))
        query_obter_tarefas = f"""
        SELECT t.id, t.titulo, t.descricao, t.prazo, t.status, t.setor, t.segmento, ut.id_usuario
        FROM tarefas t
        INNER JOIN usuarios_tarefas ut ON ut.id_tarefa = t.id
        WHERE ut.id_usuario IN ({placeholders});
        """
        cursor.execute(query_obter_tarefas, ids_equipe_auxiliares)
        
        # Obter todas as tarefas e formatá-las como uma lista de dicionários
        tarefas = cursor.fetchall()
        tarefas_list = [
            {
                "id": tarefa[0],
                "titulo": tarefa[1],
                "descricao": tarefa[2],
                "prazo": tarefa[3],
                "status": tarefa[4],
                "setor": tarefa[5],
                "segmento": tarefa[6],
                "responsavel": {
                    "id": tarefa[7],  # ID do responsável
                    "nome": nomes_equipe_auxiliares[tarefa[7]]  # Nome do responsável
                }
            }
            for tarefa in tarefas
        ]
        
        response = {
            "success": True,
            "tarefas": tarefas_list
        }
    
    except Exception as e:
        response = {
            "success": False,
            "message": str(e)  
        }
    
    finally:
        if cursor:
            cursor.close()
        if connection:
            connection.close()
        
    return response

# Função para obter as tarefas da equipe de usuários com cargo "Analista"
def obter_tarefas_analistas_equipe(id_usuario):
    response = {"success": False, "message": "Erro inesperado."}
    connection = None
    cursor = None

    try:
        connection = conectar_db()
        cursor = connection.cursor()
        
        # Query para obter o setor e segmento do usuário
        query_obter_usuario = "SELECT setor, segmento FROM usuarios WHERE id = ?;"
        cursor.execute(query_obter_usuario, (id_usuario,))
        
        # Obter o setor e segmento do usuário
        usuario = cursor.fetchone()
        if not usuario:
            response["message"] = "Usuário não encontrado."
            return response  
        
        setor, segmento = usuario
        
        # Query para obter os usuários com cargo "Analista" na mesma equipe
        query_obter_equipe_analistas = """
        SELECT id, nome FROM usuarios 
        WHERE setor = ? AND segmento = ? AND cargo = 'Analista';
        """
        cursor.execute(query_obter_equipe_analistas, (setor, segmento))
        usuarios_da_equipe = cursor.fetchall()
        
        if not usuarios_da_equipe:
            response["message"] = "Nenhum usuário com cargo 'Analista' encontrado na mesma equipe."
            return response  
        
        ids_equipe_analistas = [usuario[0] for usuario in usuarios_da_equipe]
        nomes_equipe_analistas = {usuario[0]: usuario[1] for usuario in usuarios_da_equipe}  # Dicionário com id como chave e nome como valor

        placeholders = ','.join('?' * len(ids_equipe_analistas))
        query_obter_tarefas = f"""
        SELECT t.id, t.titulo, t.descricao, t.prazo, t.status, t.setor, t.segmento, ut.id_usuario
        FROM tarefas t
        INNER JOIN usuarios_tarefas ut ON ut.id_tarefa = t.id
        WHERE ut.id_usuario IN ({placeholders});
        """
        cursor.execute(query_obter_tarefas, ids_equipe_analistas)
        
        # Obter todas as tarefas e formatá-las como uma lista de dicionários
        tarefas = cursor.fetchall()
        tarefas_list = [
            {
                "id": tarefa[0],
                "titulo": tarefa[1],
                "descricao": tarefa[2],
                "prazo": tarefa[3],
                "status": tarefa[4],
                "setor": tarefa[5],
                "segmento": tarefa[6],
                "responsavel": {
                    "id": tarefa[7], 
                    "nome": nomes_equipe_analistas[tarefa[7]]  
                }
            }
            for tarefa in tarefas
        ]
        
        response = {
            "success": True,
            "tarefas": tarefas_list
        }
    
    except Exception as e:
        response = {
            "success": False,
            "message": str(e)  
        }
    
    finally:
        if cursor:
            cursor.close()
        if connection:
            connection.close()
        
    return response

# Função para obter as tarefas de usuários do mesmo setor
def obter_tarefas_setor(id_usuario):
    response = {"success": False, "message": "Erro inesperado."}
    connection = None
    cursor = None

    try:
        connection = conectar_db()
        cursor = connection.cursor()
        
        query_obter_usuario = "SELECT setor FROM usuarios WHERE id = ?;"
        cursor.execute(query_obter_usuario, (id_usuario,))
        
        usuario = cursor.fetchone()
        if not usuario:
            response["message"] = "Usuário não encontrado."
            return response  
        
        setor = usuario[0]
        
        query_obter_equipe = "SELECT id FROM usuarios WHERE setor = ?;"
        cursor.execute(query_obter_equipe, (setor,))
        usuarios_do_setor = cursor.fetchall()
        
        if not usuarios_do_setor:
            response["message"] = "Nenhum usuário encontrado no mesmo setor."
            return response  
        
        ids_setor = [usuario[0] for usuario in usuarios_do_setor]
        
        placeholders = ','.join('?' * len(ids_setor))
        query_obter_tarefas = f"""
        SELECT t.id, t.titulo, t.descricao, t.prazo, t.status, t.setor, t.segmento
        FROM tarefas t
        INNER JOIN usuarios_tarefas ut ON ut.id_tarefa = t.id
        WHERE ut.id_usuario IN ({placeholders});
        """
        cursor.execute(query_obter_tarefas, ids_setor)
        
        tarefas = cursor.fetchall()
        tarefas_list = [
            {
                "id": tarefa[0],
                "titulo": tarefa[1],
                "descricao": tarefa[2],
                "prazo": tarefa[3],
                "status": tarefa[4],
                "setor": tarefa[5],
                "segmento": tarefa[6]
            }
            for tarefa in tarefas
        ]
        
        response = {
            "success": True,
            "tarefas": tarefas_list
        }
    
    except Exception as e:
        response = {
            "success": False,
            "message": str(e)  
        }
    
    finally:
        if cursor:
            cursor.close()
        if connection:
            connection.close()
        
    return response

# Função para obter as tarefas do setor para o dia atual
def obter_tarefas_setor_dia_atual(id_usuario):
    response = {"success": False, "message": "Erro inesperado."}
    connection = None
    cursor = None

    try:
        connection = conectar_db()
        cursor = connection.cursor()

        data_atual = datetime.now().strftime('%Y-%m-%d')

        query_obter_usuario = "SELECT setor FROM usuarios WHERE id = ?;"
        cursor.execute(query_obter_usuario, (id_usuario,))

        usuario = cursor.fetchone()
        if not usuario:
            response["message"] = "Usuário não encontrado."
            return response  

        setor = usuario[0]

        query_obter_setor = "SELECT id FROM usuarios WHERE setor = ?;"
        cursor.execute(query_obter_setor, (setor,))
        usuarios_do_setor = cursor.fetchall()

        if not usuarios_do_setor:
            response["message"] = "Nenhum usuário encontrado no mesmo setor."
            return response  

        ids_setor = [usuario[0] for usuario in usuarios_do_setor]

        placeholders = ','.join('?' * len(ids_setor))
        query_obter_tarefas = f"""
        SELECT t.id, t.titulo, t.descricao, t.prazo, t.status, t.setor
        FROM tarefas t
        INNER JOIN usuarios_tarefas ut ON ut.id_tarefa = t.id
        WHERE ut.id_usuario IN ({placeholders})
        AND (t.prazo = ? OR (t.prazo < ? AND t.status = 'Atrasada'));
        """
        
        cursor.execute(query_obter_tarefas, (*ids_setor, data_atual, data_atual))

        tarefas = cursor.fetchall()
        tarefas_list = [
            {
                "id": tarefa[0],
                "titulo": tarefa[1],
                "descricao": tarefa[2],
                "prazo": tarefa[3],
                "status": tarefa[4],
                "setor": tarefa[5]
            }
            for tarefa in tarefas
        ]

        response = {
            "success": True,
            "tarefas": tarefas_list
        }

    except Exception as e:
        response = {
            "success": False,
            "message": str(e)  
        }

    finally:
        if cursor:
            cursor.close()
        if connection:
            connection.close()
        
    return response

# Função para obter as tarefas da equipe de usuários com cargo "Auxiliar" no mesmo setor e segmento "Comércio"
def obter_tarefas_auxiliares_comercio(id_usuario):
    response = {"success": False, "message": "Erro inesperado."}
    connection = None
    cursor = None

    try:
        connection = conectar_db()
        cursor = connection.cursor()
        
        # Query para obter o setor do usuário
        query_obter_usuario = "SELECT setor FROM usuarios WHERE id = ?;"
        cursor.execute(query_obter_usuario, (id_usuario,))
        
        # Obter o setor do usuário
        usuario = cursor.fetchone()
        if not usuario:
            response["message"] = "Usuário não encontrado."
            return response  
        
        setor_usuario = usuario[0]
        
        # Query para obter os usuários com cargo "Auxiliar" no mesmo setor e segmento "Comércio"
        query_obter_equipe_auxiliares = """
        SELECT id, nome, cargo, segmento FROM usuarios 
        WHERE setor = ? AND cargo = "Auxiliar" AND segmento = "Comércio";
        """
        cursor.execute(query_obter_equipe_auxiliares, (setor_usuario,))
        usuarios_da_equipe = cursor.fetchall()
        
        if not usuarios_da_equipe:
            response["message"] = "Nenhum usuário com cargo 'Auxiliar' encontrado no setor e segmento 'Comércio'."
            return response  
        
        # Dicionário com ID como chave e dados do auxiliar (nome, cargo e segmento)
        dados_equipe_auxiliares = {usuario[0]: {"nome": usuario[1], "cargo": usuario[2], "segmento": usuario[3]} for usuario in usuarios_da_equipe}

        # Gerando placeholders para a query das tarefas
        ids_equipe_auxiliares = list(dados_equipe_auxiliares.keys())
        placeholders = ','.join('?' * len(ids_equipe_auxiliares))
        
        # Query para obter as tarefas dos auxiliares no setor do usuário
        query_obter_tarefas = f"""
        SELECT t.id, t.titulo, t.descricao, t.prazo, t.status, t.setor, t.segmento, ut.id_usuario
        FROM tarefas t
        INNER JOIN usuarios_tarefas ut ON ut.id_tarefa = t.id
        WHERE ut.id_usuario IN ({placeholders});
        """
        cursor.execute(query_obter_tarefas, ids_equipe_auxiliares)
        
        # Obter todas as tarefas e formatá-las como uma lista de dicionários
        tarefas = cursor.fetchall()
        tarefas_list = [
            {
                "id": tarefa[0],
                "titulo": tarefa[1],
                "descricao": tarefa[2],
                "prazo": tarefa[3],
                "status": tarefa[4],
                "setor": tarefa[5],
                "segmento": tarefa[6],
                "responsavel": {
                    "id": tarefa[7],  # ID do responsável
                    "nome": dados_equipe_auxiliares[tarefa[7]]["nome"],  # Nome do responsável
                    "cargo": dados_equipe_auxiliares[tarefa[7]]["cargo"],  # Cargo do responsável
                    "segmento": dados_equipe_auxiliares[tarefa[7]]["segmento"]  # Segmento do responsável
                }
            }
            for tarefa in tarefas
        ]
        
        response = {
            "success": True,
            "tarefas": tarefas_list
        }
    
    except Exception as e:
        response = {
            "success": False,
            "message": str(e)  
        }
    
    finally:
        if cursor:
            cursor.close()
        if connection:
            connection.close()
        
    return response

# Função para obter as tarefas da equipe de usuários com cargo "Auxiliar" no mesmo setor e segmento "Comércio"
def obter_tarefas_auxiliares_supermercado(id_usuario):
    response = {"success": False, "message": "Erro inesperado."}
    connection = None
    cursor = None

    try:
        connection = conectar_db()
        cursor = connection.cursor()
        
        # Query para obter o setor do usuário
        query_obter_usuario = "SELECT setor FROM usuarios WHERE id = ?;"
        cursor.execute(query_obter_usuario, (id_usuario,))
        
        # Obter o setor do usuário
        usuario = cursor.fetchone()
        if not usuario:
            response["message"] = "Usuário não encontrado."
            return response  
        
        setor_usuario = usuario[0]
        
        # Query para obter os usuários com cargo "Auxiliar" no mesmo setor e segmento "Comércio"
        query_obter_equipe_auxiliares = """
        SELECT id, nome, cargo, segmento FROM usuarios 
        WHERE setor = ? AND cargo = "Auxiliar" AND segmento = "Supermercado";
        """
        cursor.execute(query_obter_equipe_auxiliares, (setor_usuario,))
        usuarios_da_equipe = cursor.fetchall()
        
        if not usuarios_da_equipe:
            response["message"] = "Nenhum usuário com cargo 'Auxiliar' encontrado no setor e segmento 'Supermercado'."
            return response  
        
        # Dicionário com ID como chave e dados do auxiliar (nome, cargo e segmento)
        dados_equipe_auxiliares = {usuario[0]: {"nome": usuario[1], "cargo": usuario[2], "segmento": usuario[3]} for usuario in usuarios_da_equipe}

        # Gerando placeholders para a query das tarefas
        ids_equipe_auxiliares = list(dados_equipe_auxiliares.keys())
        placeholders = ','.join('?' * len(ids_equipe_auxiliares))
        
        # Query para obter as tarefas dos auxiliares no setor do usuário
        query_obter_tarefas = f"""
        SELECT t.id, t.titulo, t.descricao, t.prazo, t.status, t.setor, t.segmento, ut.id_usuario
        FROM tarefas t
        INNER JOIN usuarios_tarefas ut ON ut.id_tarefa = t.id
        WHERE ut.id_usuario IN ({placeholders});
        """
        cursor.execute(query_obter_tarefas, ids_equipe_auxiliares)
        
        # Obter todas as tarefas e formatá-las como uma lista de dicionários
        tarefas = cursor.fetchall()
        tarefas_list = [
            {
                "id": tarefa[0],
                "titulo": tarefa[1],
                "descricao": tarefa[2],
                "prazo": tarefa[3],
                "status": tarefa[4],
                "setor": tarefa[5],
                "segmento": tarefa[6],
                "responsavel": {
                    "id": tarefa[7],  # ID do responsável
                    "nome": dados_equipe_auxiliares[tarefa[7]]["nome"],  # Nome do responsável
                    "cargo": dados_equipe_auxiliares[tarefa[7]]["cargo"],  # Cargo do responsável
                    "segmento": dados_equipe_auxiliares[tarefa[7]]["segmento"]  # Segmento do responsável
                }
            }
            for tarefa in tarefas
        ]
        
        response = {
            "success": True,
            "tarefas": tarefas_list
        }
    
    except Exception as e:
        response = {
            "success": False,
            "message": str(e)  
        }
    
    finally:
        if cursor:
            cursor.close()
        if connection:
            connection.close()
        
    return response

# Função para obter as tarefas da equipe de usuários com cargo "Auxiliar" no mesmo setor e segmento "Comércio"
def obter_tarefas_auxiliares_industria(id_usuario):
    response = {"success": False, "message": "Erro inesperado."}
    connection = None
    cursor = None

    try:
        connection = conectar_db()
        cursor = connection.cursor()
        
        # Query para obter o setor do usuário
        query_obter_usuario = "SELECT setor FROM usuarios WHERE id = ?;"
        cursor.execute(query_obter_usuario, (id_usuario,))
        
        # Obter o setor do usuário
        usuario = cursor.fetchone()
        if not usuario:
            response["message"] = "Usuário não encontrado."
            return response  
        
        setor_usuario = usuario[0]
        
        # Query para obter os usuários com cargo "Auxiliar" no mesmo setor e segmento "Comércio"
        query_obter_equipe_auxiliares = """
        SELECT id, nome, cargo, segmento FROM usuarios 
        WHERE setor = ? AND cargo = "Auxiliar" AND segmento = "Indústria";
        """
        cursor.execute(query_obter_equipe_auxiliares, (setor_usuario,))
        usuarios_da_equipe = cursor.fetchall()
        
        if not usuarios_da_equipe:
            response["message"] = "Nenhum usuário com cargo 'Auxiliar' encontrado no setor e segmento 'Indústria'."
            return response  
        
        # Dicionário com ID como chave e dados do auxiliar (nome, cargo e segmento)
        dados_equipe_auxiliares = {usuario[0]: {"nome": usuario[1], "cargo": usuario[2], "segmento": usuario[3]} for usuario in usuarios_da_equipe}

        # Gerando placeholders para a query das tarefas
        ids_equipe_auxiliares = list(dados_equipe_auxiliares.keys())
        placeholders = ','.join('?' * len(ids_equipe_auxiliares))
        
        # Query para obter as tarefas dos auxiliares no setor do usuário
        query_obter_tarefas = f"""
        SELECT t.id, t.titulo, t.descricao, t.prazo, t.status, t.setor, t.segmento, ut.id_usuario
        FROM tarefas t
        INNER JOIN usuarios_tarefas ut ON ut.id_tarefa = t.id
        WHERE ut.id_usuario IN ({placeholders});
        """
        cursor.execute(query_obter_tarefas, ids_equipe_auxiliares)
        
        # Obter todas as tarefas e formatá-las como uma lista de dicionários
        tarefas = cursor.fetchall()
        tarefas_list = [
            {
                "id": tarefa[0],
                "titulo": tarefa[1],
                "descricao": tarefa[2],
                "prazo": tarefa[3],
                "status": tarefa[4],
                "setor": tarefa[5],
                "segmento": tarefa[6],
                "responsavel": {
                    "id": tarefa[7],  # ID do responsável
                    "nome": dados_equipe_auxiliares[tarefa[7]]["nome"],  # Nome do responsável
                    "cargo": dados_equipe_auxiliares[tarefa[7]]["cargo"],  # Cargo do responsável
                    "segmento": dados_equipe_auxiliares[tarefa[7]]["segmento"]  # Segmento do responsável
                }
            }
            for tarefa in tarefas
        ]
        
        response = {
            "success": True,
            "tarefas": tarefas_list
        }
    
    except Exception as e:
        response = {
            "success": False,
            "message": str(e)  
        }
    
    finally:
        if cursor:
            cursor.close()
        if connection:
            connection.close()
        
    return response

# Função para obter as tarefas da equipe de usuários com cargo "Auxiliar" no mesmo setor e segmento "Comércio"
def obter_tarefas_analistas_comercio(id_usuario):
    response = {"success": False, "message": "Erro inesperado."}
    connection = None
    cursor = None

    try:
        connection = conectar_db()
        cursor = connection.cursor()
        
        # Query para obter o setor do usuário
        query_obter_usuario = "SELECT setor FROM usuarios WHERE id = ?;"
        cursor.execute(query_obter_usuario, (id_usuario,))
        
        # Obter o setor do usuário
        usuario = cursor.fetchone()
        if not usuario:
            response["message"] = "Usuário não encontrado."
            return response  
        
        setor_usuario = usuario[0]
        
        # Query para obter os usuários com cargo "Analista" no mesmo setor e segmento "Comércio"
        query_obter_equipe_analistas = """
        SELECT id, nome, cargo, segmento FROM usuarios 
        WHERE setor = ? AND cargo = "Analista" AND segmento = "Comércio";
        """
        cursor.execute(query_obter_equipe_analistas, (setor_usuario,))
        usuarios_da_equipe = cursor.fetchall()
        
        if not usuarios_da_equipe:
            response["message"] = "Nenhum usuário com cargo 'Analista' encontrado no setor e segmento 'Comércio'."
            return response  
        
        # Dicionário com ID como chave e dados do analista (nome, cargo e segmento)
        dados_equipe_analistas = {usuario[0]: {"nome": usuario[1], "cargo": usuario[2], "segmento": usuario[3]} for usuario in usuarios_da_equipe}

        # Gerando placeholders para a query das tarefas
        ids_equipe_analistas = list(dados_equipe_analistas.keys())
        placeholders = ','.join('?' * len(ids_equipe_analistas))
        
        # Query para obter as tarefas dos analistas no setor do usuário
        query_obter_tarefas = f"""
        SELECT t.id, t.titulo, t.descricao, t.prazo, t.status, t.setor, t.segmento, ut.id_usuario
        FROM tarefas t
        INNER JOIN usuarios_tarefas ut ON ut.id_tarefa = t.id
        WHERE ut.id_usuario IN ({placeholders});
        """
        cursor.execute(query_obter_tarefas, ids_equipe_analistas)
        
        # Obter todas as tarefas e formatá-las como uma lista de dicionários
        tarefas = cursor.fetchall()
        tarefas_list = [
            {
                "id": tarefa[0],
                "titulo": tarefa[1],
                "descricao": tarefa[2],
                "prazo": tarefa[3],
                "status": tarefa[4],
                "setor": tarefa[5],
                "segmento": tarefa[6],
                "responsavel": {
                    "id": tarefa[7],  # ID do responsável
                    "nome": dados_equipe_analistas[tarefa[7]]["nome"],  # Nome do responsável
                    "cargo": dados_equipe_analistas[tarefa[7]]["cargo"],  # Cargo do responsável
                    "segmento": dados_equipe_analistas[tarefa[7]]["segmento"]  # Segmento do responsável
                }
            }
            for tarefa in tarefas
        ]
        
        response = {
            "success": True,
            "tarefas": tarefas_list
        }
    
    except Exception as e:
        response = {
            "success": False,
            "message": str(e)  
        }
    
    finally:
        if cursor:
            cursor.close()
        if connection:
            connection.close()
        
    return response

# Função para obter as tarefas da equipe de usuários com cargo "Auxiliar" no mesmo setor e segmento "Comércio"
def obter_tarefas_analistas_supermercado(id_usuario):
    response = {"success": False, "message": "Erro inesperado."}
    connection = None
    cursor = None

    try:
        connection = conectar_db()
        cursor = connection.cursor()
        
        # Query para obter o setor do usuário
        query_obter_usuario = "SELECT setor FROM usuarios WHERE id = ?;"
        cursor.execute(query_obter_usuario, (id_usuario,))
        
        # Obter o setor do usuário
        usuario = cursor.fetchone()
        if not usuario:
            response["message"] = "Usuário não encontrado."
            return response  
        
        setor_usuario = usuario[0]
        
        # Query para obter os usuários com cargo "Analista" no mesmo setor e segmento "Comércio"
        query_obter_equipe_analistas = """
        SELECT id, nome, cargo, segmento FROM usuarios 
        WHERE setor = ? AND cargo = "Analista" AND segmento = "Supermercado";
        """
        cursor.execute(query_obter_equipe_analistas, (setor_usuario,))
        usuarios_da_equipe = cursor.fetchall()
        
        if not usuarios_da_equipe:
            response["message"] = "Nenhum usuário com cargo 'Analista' encontrado no setor e segmento 'Supermercado'."
            return response  
        
        # Dicionário com ID como chave e dados do analista (nome, cargo e segmento)
        dados_equipe_analistas = {usuario[0]: {"nome": usuario[1], "cargo": usuario[2], "segmento": usuario[3]} for usuario in usuarios_da_equipe}

        # Gerando placeholders para a query das tarefas
        ids_equipe_analistas = list(dados_equipe_analistas.keys())
        placeholders = ','.join('?' * len(ids_equipe_analistas))
        
        # Query para obter as tarefas dos analistas no setor do usuário
        query_obter_tarefas = f"""
        SELECT t.id, t.titulo, t.descricao, t.prazo, t.status, t.setor, t.segmento, ut.id_usuario
        FROM tarefas t
        INNER JOIN usuarios_tarefas ut ON ut.id_tarefa = t.id
        WHERE ut.id_usuario IN ({placeholders});
        """
        cursor.execute(query_obter_tarefas, ids_equipe_analistas)
        
        # Obter todas as tarefas e formatá-las como uma lista de dicionários
        tarefas = cursor.fetchall()
        tarefas_list = [
            {
                "id": tarefa[0],
                "titulo": tarefa[1],
                "descricao": tarefa[2],
                "prazo": tarefa[3],
                "status": tarefa[4],
                "setor": tarefa[5],
                "segmento": tarefa[6],
                "responsavel": {
                    "id": tarefa[7],  # ID do responsável
                    "nome": dados_equipe_analistas[tarefa[7]]["nome"],  # Nome do responsável
                    "cargo": dados_equipe_analistas[tarefa[7]]["cargo"],  # Cargo do responsável
                    "segmento": dados_equipe_analistas[tarefa[7]]["segmento"]  # Segmento do responsável
                }
            }
            for tarefa in tarefas
        ]
        
        response = {
            "success": True,
            "tarefas": tarefas_list
        }
    
    except Exception as e:
        response = {
            "success": False,
            "message": str(e)  
        }
    
    finally:
        if cursor:
            cursor.close()
        if connection:
            connection.close()
        
    return response

# Função para obter as tarefas da equipe de usuários com cargo "Auxiliar" no mesmo setor e segmento "Comércio"
def obter_tarefas_analistas_industria(id_usuario):
    response = {"success": False, "message": "Erro inesperado."}
    connection = None
    cursor = None

    try:
        connection = conectar_db()
        cursor = connection.cursor()
        
        # Query para obter o setor do usuário
        query_obter_usuario = "SELECT setor FROM usuarios WHERE id = ?;"
        cursor.execute(query_obter_usuario, (id_usuario,))
        
        # Obter o setor do usuário
        usuario = cursor.fetchone()
        if not usuario:
            response["message"] = "Usuário não encontrado."
            return response  
        
        setor_usuario = usuario[0]
        
        # Query para obter os usuários com cargo "Analista" no mesmo setor e segmento "Comércio"
        query_obter_equipe_analistas = """
        SELECT id, nome, cargo, segmento FROM usuarios 
        WHERE setor = ? AND cargo = "Analista" AND segmento = "Indústria";
        """
        cursor.execute(query_obter_equipe_analistas, (setor_usuario,))
        usuarios_da_equipe = cursor.fetchall()
        
        if not usuarios_da_equipe:
            response["message"] = "Nenhum usuário com cargo 'Analista' encontrado no setor e segmento 'Indústria'."
            return response  
        
        # Dicionário com ID como chave e dados do analista (nome, cargo e segmento)
        dados_equipe_analistas = {usuario[0]: {"nome": usuario[1], "cargo": usuario[2], "segmento": usuario[3]} for usuario in usuarios_da_equipe}

        # Gerando placeholders para a query das tarefas
        ids_equipe_analistas = list(dados_equipe_analistas.keys())
        placeholders = ','.join('?' * len(ids_equipe_analistas))
        
        # Query para obter as tarefas dos analistas no setor do usuário
        query_obter_tarefas = f"""
        SELECT t.id, t.titulo, t.descricao, t.prazo, t.status, t.setor, t.segmento, ut.id_usuario
        FROM tarefas t
        INNER JOIN usuarios_tarefas ut ON ut.id_tarefa = t.id
        WHERE ut.id_usuario IN ({placeholders});
        """
        cursor.execute(query_obter_tarefas, ids_equipe_analistas)
        
        # Obter todas as tarefas e formatá-las como uma lista de dicionários
        tarefas = cursor.fetchall()
        tarefas_list = [
            {
                "id": tarefa[0],
                "titulo": tarefa[1],
                "descricao": tarefa[2],
                "prazo": tarefa[3],
                "status": tarefa[4],
                "setor": tarefa[5],
                "segmento": tarefa[6],
                "responsavel": {
                    "id": tarefa[7],  # ID do responsável
                    "nome": dados_equipe_analistas[tarefa[7]]["nome"],  # Nome do responsável
                    "cargo": dados_equipe_analistas[tarefa[7]]["cargo"],  # Cargo do responsável
                    "segmento": dados_equipe_analistas[tarefa[7]]["segmento"]  # Segmento do responsável
                }
            }
            for tarefa in tarefas
        ]
        
        response = {
            "success": True,
            "tarefas": tarefas_list
        }
    
    except Exception as e:
        response = {
            "success": False,
            "message": str(e)  
        }
    
    finally:
        if cursor:
            cursor.close()
        if connection:
            connection.close()
        
    return response

# Função para verificar tarefas atrasadas
def verificar_tarefas_atrasadas(id_usuario):
    response = {"success": False, "message": "Erro inesperado."}
    connection = None
    cursor = None

    try:
        connection = conectar_db()
        cursor = connection.cursor()
        
        data_atual = datetime.now().strftime('%Y-%m-%d')
        
        query_verificar_tarefas = """
            SELECT t.id
            FROM tarefas t
            INNER JOIN usuarios_tarefas ut ON ut.id_tarefa = t.id
            WHERE ut.id_usuario = ? AND t.prazo < ? AND t.status = 'Pendente';
        """
        
        cursor.execute(query_verificar_tarefas, (id_usuario, data_atual))
        tarefas_atrasadas = cursor.fetchall()
        
        tarefas_atualizadas = []
        
        for tarefa in tarefas_atrasadas:
            tarefa_id = tarefa[0]
            
            # Obter o status atual da tarefa antes de atualizar
            query_obter_status_antigo = """
                SELECT status
                FROM tarefas
                WHERE id = ?;
            """
            cursor.execute(query_obter_status_antigo, (tarefa_id,))
            status_antigo = cursor.fetchone()[0]
            
            # Registrar a alteração de status antes de atualizar
            registrar_alteracao_status(connection, tarefa_id, 'Atrasada', 0, status_antigo)
            
            # Atualiza o status da tarefa para 'Atrasada'
            query_atualizar_status = """
                UPDATE tarefas
                SET status = 'Atrasada'
                WHERE id = ?;
            """
            cursor.execute(query_atualizar_status, (tarefa_id,))

            tarefas_atualizadas.append(tarefa_id)

        connection.commit()  

        # Se não houver erros, define o retorno de sucesso
        response = {
            "success": True,
            "tarefas_atualizadas": tarefas_atualizadas
        }

    except Exception as e:
        response = {
            "success": False,
            "message": str(e)  
        }
    
    finally:
        if cursor:
            cursor.close()
        if connection:
            connection.close()
        
    return json.dumps(response)  

# Função para registrar alteração de status
def registrar_alteracao_status(connection, id_tarefa, status_novo, id_usuario, status_antigo):
    cursor = connection.cursor()  
    
    try:
        # Data e hora de alteração
        data_alteracao = datetime.now().strftime('%Y-%m-%d')
        hora_alteracao = datetime.now().strftime('%H:%M:%S')
        
        # Inserir a alteração de status na tabela alteracao_status
        query_inserir_alteracao = """
            INSERT INTO alteracao_status (id_tarefa, data_alteracao, hora_alteracao, status_antigo, status_novo, id_usuario)
            VALUES (?, ?, ?, ?, ?, ?);
        """
        cursor.execute(query_inserir_alteracao, (id_tarefa, data_alteracao, hora_alteracao, status_antigo, status_novo, id_usuario))

    except Exception as e:
        # Lida com erros se necessário
        print(f"Erro ao registrar alteração de status: {str(e)}")
    finally:
        cursor.close()

# Lógica para receber argumentos do Electron
if __name__ == '__main__':
    if sys.argv[1] == "executar_consulta_sql":
        sql_query = sys.argv[2]  
        resultado = executar_consulta_sql(sql_query)
        print(json.dumps(resultado))
    elif len(sys.argv) > 1 and sys.argv[1] == 'login':
        email = sys.argv[2]
        senha = sys.argv[3]
        result = login(email, senha)
        print(json.dumps(result))  
    elif sys.argv[1] == 'register':
        nome = sys.argv[2]
        cargo = sys.argv[3]
        setor = sys.argv[4]
        segmento = sys.argv[5]
        email = sys.argv[6]
        senha = sys.argv[7]
        result = register(nome, cargo, setor, segmento, email, senha)
        print(json.dumps(result))
    elif sys.argv[1] == 'obter_dados_usuario':
        id_usuario = int(sys.argv[2])
        result = obter_dados_usuario(id_usuario)
        print(json.dumps(result))
    elif sys.argv[1] == 'atualizar_dados_usuario':
        id_usuario = int(sys.argv[2])
        nome = sys.argv[3]
        cargo = sys.argv[4]
        setor = sys.argv[5]
        segmento = sys.argv[6]
        email = sys.argv[7]
        senha = sys.argv[8]
        foto = sys.argv[9] if len(sys.argv) > 9 else None
        result = atualizar_dados_usuario(id_usuario, nome, cargo, setor, segmento, email, senha, foto)
        print(json.dumps(result))
    elif sys.argv[1] == 'obter_tarefas_usuario':
        id_usuario = int(sys.argv[2])
        result = obter_tarefas_usuario(id_usuario)
        print(json.dumps(result))  
    elif sys.argv[1] == "obter_tarefas_usuario_dia_atual":
        id_usuario = int(sys.argv[2])
        result = obter_tarefas_usuario_dia_atual(id_usuario)
        print(json.dumps(result))
    elif sys.argv[1] == 'obter_tarefas_equipe':
        id_usuario = int(sys.argv[2])
        result = obter_tarefas_equipe(id_usuario)
        print(json.dumps(result))
    elif sys.argv[1] == "obter_tarefas_equipe_dia_atual":
        id_usuario = int(sys.argv[2])
        result = obter_tarefas_equipe_dia_atual(id_usuario)
        print(json.dumps(result))
    elif sys.argv[1] == 'obter_tarefas_auxiliares_equipe':
        id_usuario = int(sys.argv[2])
        result = obter_tarefas_auxiliares_equipe(id_usuario)
        print(json.dumps(result))
    elif sys.argv[1] == 'obter_tarefas_analistas_equipe':
        id_usuario = int(sys.argv[2])
        result = obter_tarefas_analistas_equipe(id_usuario)
        print(json.dumps(result))
    elif sys.argv[1] == 'obter_tarefas_setor':
        id_usuario = int(sys.argv[2])
        result = obter_tarefas_setor(id_usuario)
        print(json.dumps(result))
    elif sys.argv[1] == "obter_tarefas_setor_dia_atual":
        id_usuario = int(sys.argv[2])
        result = obter_tarefas_setor_dia_atual(id_usuario)
        print(json.dumps(result))
    elif sys.argv[1] == 'obter_tarefas_auxiliares_comercio':
        id_usuario = int(sys.argv[2])
        result = obter_tarefas_auxiliares_comercio(id_usuario)
        print(json.dumps(result))
    elif sys.argv[1] == 'obter_tarefas_auxiliares_supermercado':
        id_usuario = int(sys.argv[2])
        result = obter_tarefas_auxiliares_supermercado(id_usuario)
        print(json.dumps(result))
    elif sys.argv[1] == 'obter_tarefas_auxiliares_industria':
        id_usuario = int(sys.argv[2])
        result = obter_tarefas_auxiliares_industria(id_usuario)
        print(json.dumps(result))
    elif sys.argv[1] == 'obter_tarefas_analistas_comercio':
        id_usuario = int(sys.argv[2])
        result = obter_tarefas_analistas_comercio(id_usuario)
        print(json.dumps(result))
    elif sys.argv[1] == 'obter_tarefas_analistas_supermercado':
        id_usuario = int(sys.argv[2])
        result = obter_tarefas_analistas_supermercado(id_usuario)
        print(json.dumps(result))
    elif sys.argv[1] == 'obter_tarefas_analistas_industria':
        id_usuario = int(sys.argv[2])
        result = obter_tarefas_analistas_industria(id_usuario)
        print(json.dumps(result))
    elif sys.argv[1] == 'verificar_tarefas_atrasadas':
        id_usuario = int(sys.argv[2])
        result = verificar_tarefas_atrasadas(id_usuario)
        print(json.dumps(result))    
    elif sys.argv[1] == 'registrar_alteracao_status':
        id_tarefa = int(sys.argv[2])
        status_novo = sys.argv[3]
        result = registrar_alteracao_status(id_tarefa, status_novo)
        print(json.dumps(result))    
    else:
        print(json.dumps({"success": False, "message": "Argumentos não fornecidos corretamente."}))
