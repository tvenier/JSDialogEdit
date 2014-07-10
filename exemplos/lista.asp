<%
Option Explicit
Response.Buffer = True

Dim fso, arquivo, stream, tipo, nome, saida, caminho, ForReading, conteudo

caminho = "."
ForReading = 1

If Request.ServerVariables("REQUEST_METHOD") = "GET" Then
    saida = ""
    tipo = Request.QueryString("tipo")
    nome = Request.QueryString("nome")
    
    Set fso = Server.CreateObject("Scripting.FileSystemObject")
    
    If nome = "" Then
        For Each arquivo In fso.GetFolder(Server.MapPath(caminho)).Files
            If InStr(arquivo.name, tipo) > 0 Then
                If saida <> "" Then
                    saida = saida & ","
                End If
                saida = saida & """" & arquivo.name & """"
            End If
        Next
        
        Response.Write "[" & saida & "]"
        Response.End
    Else
        nome = Replace(Replace(nome, "..", "_"), "\", "_")
        nome = caminho & "\" & nome
        If fso.FileExists(Server.MapPath(nome)) Then
            tipo = Split(nome, ".")
            nome = Server.MapPath(nome)
            Set arquivo = fso.GetFile(nome)
            
            Response.AddHeader "Content-Description", "File Transfer"
            If tipo(2) = "JSON" Then
                Response.AddHeader "Content-Type", "application/json"
            ElseIf tipo(2) = "XML" Then
                Response.AddHeader "Content-Type", "text/xml"
            Else
                Response.AddHeader "Content-Type", "text/plain"
            End If
            Response.AddHeader "Content-Disposition", "attachment; filename=" & arquivo.Name
            Response.AddHeader "Content-Transfer-Encoding", "binary"
            Response.AddHeader "Expires", "0"
            Response.AddHeader "Cache-Control", "no-store, no-cache, must-revalidate, post-check=0, pre-check=0"
            Response.AddHeader "Pragma", "no-cache"
            Response.AddHeader "Content-Length", arquivo.Size
            Response.Clear
            Set stream = arquivo.OpenAsTextStream(ForReading)
            Response.Write stream.ReadAll
            stream.Close
            Response.End
        Else
            Response.Write "Arquivo nao existe" & nome
        End If
        Response.End
    End If
Else
    nome = Request.Form("nome")
    conteudo = Request.Form("conteudo")
    
    If nome <> "" Then
        nome =  "\" & nome
        Set fso = Server.CreateObject("Scripting.FileSystemObject")
        Set arquivo = fso.CreateTextFile(Server.MapPath(caminho) & nome)
        arquivo.WriteLine(conteudo)
        arquivo.Close()
    Else
        Response.Write "Parametros incorretos"
    End If
End If
%>