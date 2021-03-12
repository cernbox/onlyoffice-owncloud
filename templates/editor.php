<script>
     var this_app = '<?php p($_['appName']) ?>';
     var stop_heartbeat = true;
     var open_file = '<?php echo $_['file'] ?>';
     var open_file_type = '<?php p($_['type']) ?>';
<?php if ($_['pl_token'] != null) { // we are in a public link ?>

     var getUrlParameter = function(sParam) {
          var urlParams = new URLSearchParams(window.location.search);
          return urlParams.get(sParam)
     };

     var pl_token = '<?php p($_['pl_token']) ?>';
     x_access_token = getUrlParameter('X-Access-Token');

     if (x_access_token == null) {
          // Use session storage to keep it only for the current tab
          // We will also check in the app if the token is valid or if we need to send the user to the public link
          x_access_token = sessionStorage.getItem('X-Access-Token');
     } else {
          sessionStorage.setItem('X-Access-Token', x_access_token);
     }

     // Drop all query parameters from the url
     cleaned_url = location.protocol + '//' + location.host + location.pathname;
     history.replaceState('', '', cleaned_url);

<?php } ?>
</script>

<?php
script($_['appName'], 'editor');
script($_['appName'], 'main');
style($_['appName'], 'editor');
style($_['appName'], 'main');
?>

<div id="app">
<div id="loader">Loading the application...</div>
</div>