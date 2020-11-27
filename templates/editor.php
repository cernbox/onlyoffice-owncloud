<script>
     var this_app = '<?php p($_['appName']) ?>';
     var stop_heartbeat = true;
     var open_file = '<?php echo $_['file'] ?>';
     var open_file_type = '<?php p($_['type']) ?>';
<?php if ($_['pl_token'] != null) { ?>
     var pl_token = '<?php p($_['pl_token']) ?>';
<?php } ?>
</script>

<style>
#loader {
    text-align: center;
    position: relative;
    top: 50%;
    transform: translateY(-50%);
    font-size: 2em;
    color: #4f4f4f;
}
</style>

<?php
script($_['appName'], 'editor');
script($_['appName'], 'main');
style($_['appName'], 'editor');
style($_['appName'], 'main');
?>

<div id="app">
<div id="loader">Loading the application...</div>
</div>