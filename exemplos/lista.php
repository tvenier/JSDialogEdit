<?php
$CAMINHO = './';
$lista = '';
$tipo = '';
$nome = '';

if($_SERVER['REQUEST_METHOD'] == 'GET') {
    if(isset($_GET["tipo"])) $tipo = $_GET["tipo"];
    if(isset($_GET["nome"]))$nome = $_GET["nome"];
    
    if ($handle = opendir($CAMINHO)) {
        if($nome == '') {
            $tipo = '.' . $tipo;
            while (false !== ($file = readdir($handle))) {
                if ($file != "." && $file != ".." && stristr($file, $tipo) == TRUE) {
                    if($lista != '') $lista .= ',';
                    $lista .= '"' . $file . '"';
                }
            }
            
            header('Content-Type: application/json');
            echo "[$lista]";
        } else {
            $nome = str_replace('/', '_', str_replace('..', '_', $nome));
            $nome = $CAMINHO . $nome;
            if(file_exists($nome)) {
                header('Content-Description: File Transfer');
                if($tipo == 'json') {
                    header('Content-Type: application/json');
                } else if($tipo == 'xml') {
                    header('Content-Type: text/xml');
                } else {
                    header('Content-Type: text/plain');
                }
                header('Content-Disposition: attachment; filename='.basename($nome));
                header('Content-Transfer-Encoding: binary');
                header('Expires: 0');
                header('Cache-Control: no-store, no-cache, must-revalidate, post-check=0, pre-check=0');
                header('Pragma: no-cache');
                header('Content-Length: ' . filesize($nome));
                ob_clean();
                flush();
                readfile($nome);
                exit;
            } else {
                echo 'Arquivo nao existe' . $nome;
            }
        }
        
        closedir($handle);
    } else {
        echo 'Pasta nao encontrada';
    }
} else if($_SERVER['REQUEST_METHOD'] == 'POST') {
    $nome = $_POST["nome"];
    $conteudo = $_POST["conteudo"];
    
    if($nome != '') {
        $handle = fopen($CAMINHO . $nome, 'w') or die("can't open file");
        $fwrite = fwrite($handle, $conteudo);
        if ($fwrite === false) {
            fclose($handle);
            die("can't write file");
        }
        fclose($handle);
    } else {
        echo 'Parametros incorretos';
    }
}
?>