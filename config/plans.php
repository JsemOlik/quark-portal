<?php
// config/plans.php

return [
    // Resource mapping for provisioning
    'resources' => [
        'core' => [
            'memory_mb' => 4096,
            'disk_mb' => 0,
            'cpu_percent' => 400, // 200% = 2 vCPU time share
            'swap_mb' => 0,
            'io' => 500,
            'backups' => 5,
            'databases' => 10,
            'allocations' => 12,
        ],
        'boost' => [
            'memory_mb' => 6144,
            'disk_mb' => 0,
            'cpu_percent' => 400,
            'swap_mb' => 0,
            'io' => 500,
            'backups' => 5,
            'databases' => 10,
            'allocations' => 12,
        ],
        'power' => [
            'memory_mb' => 8192,
            'disk_mb' => 0,
            'cpu_percent' => 400,
            'swap_mb' => 0,
            'io' => 500,
            'backups' => 5,
            'databases' => 10,
            'allocations' => 12,
        ],
        'extreme' => [
            'memory_mb' => 10240,
            'disk_mb' => 0,
            'cpu_percent' => 400,
            'swap_mb' => 0,
            'io' => 500,
            'backups' => 5,
            'databases' => 10,
            'allocations' => 12,
        ],
    ],
];


