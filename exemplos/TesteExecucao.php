<?php
// URL: exemplos/TesteExecucao.php
header('Content-Type: application/json');
header('Expires: 0');
header('Cache-Control: no-store, no-cache, must-revalidate, post-check=0, pre-check=0');
header('Pragma: no-cache');

$retorno = '';
foreach($_POST as $k => $v) {
    if($retorno != '') $retorno .= ", ";
    $retorno .= "'$k' : '$v'";
}
echo '{' . $retorno . '}';
?>