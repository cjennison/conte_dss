<?php
 
echo "<form action='RunDAR.php' method='get'>";
echo "Lat:<input name='y' type='text' size='10' value='' /><p>";
echo "Lon:<input name='x' type='text' size='10' value='' /><p>";
echo "DA:<input name='da' type='text' size='10' value='' /><p>";
echo "<input type='submit' />";
echo "</form>";
 
if(isset($_GET['y']))
{
  $arg1 = $_GET['y'];
  $arg2 = $_GET['x'];
  $arg3 = $_GET['da'];

  // execute R script from shell
  // this will save a plot at temp.png to the filesystem
  exec("Rscript DAR.R $arg1 $arg2 $arg3");
 
  // return image tag
$nocache = rand();
$i='temp.png?$nocache';

//echo("<img src='temp.png?$nocache' />");

echo "<script type='text/javascript'>";
echo "myWindow=window.open('','','width=500,height=650');";
echo "myWindow.document.write('<img src=".$i." />');";
echo "myWindow.focus();";
echo "</script>"; 

}

?>