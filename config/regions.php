<?php

// config/regions.php
return [
    // Map our front-end region to a Pterodactyl location id
    'eu-central' => [
        'location_id' => 1,
        // optionally, preferred node IDs if we want to target a specific node
        'preferred_node_ids' => [],
    ],
];
