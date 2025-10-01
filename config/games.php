<?php

// config/games.php
return [
    'minecraft' => [
        'nest_id' => 1,
        'variants' => [
            'paper' => [
                'label' => 'Paper',
                'egg_id' => 2,
                'docker_image' => 'ghcr.io/pterodactyl/yolks:java_21',
                'startup' => 'java -Xms128M -XX:MaxRAMPercentage=95.0 -Dterminal.jline=false -Dterminal.ansi=true -jar {{SERVER_JARFILE}}',
                'env' => [
                    'MINECRAFT_VERSION' => 'latest',
                    'SERVER_JARFILE' => 'paper.jar',
                    'DL_PATH' => '',
                    'BUILD_NUMBER' => 'latest',
                ],
            ],
            'vanilla' => [
                'label' => 'Vanilla',
                'egg_id' => 4,
                'docker_image' => 'ghcr.io/pterodactyl/yolks:java_21',
                'startup' => 'java -Xms128M -XX:MaxRAMPercentage=95.0 -jar {{SERVER_JARFILE}}',
                'env' => [
                    'SERVER_JARFILE' => 'server.jar',
                    'VANILLA_VERSION' => 'latest',
                ],
            ],
            'purpur' => [
                'label' => 'Purpur',
                'egg_id' => 1,
                'docker_image' => 'ghcr.io/pterodactyl/yolks:java_21',
                'startup' => 'java --add-modules=jdk.incubator.vector -Xms128M -XX:MaxRAMPercentage=95.0 -Dterminal.jline=false -Dterminal.ansi=true -jar {{SERVER_JARFILE}}',
                'env' => [
                    'MINECRAFT_VERSION' => 'latest',
                    'SERVER_JARFILE' => 'purpur.jar',
                    'BUILD_NUMBER' => 'latest',
                ],
            ],
            'bungeecord' => [
                'label' => 'Bungeecord',
                'egg_id' => 3,
                'docker_image' => 'ghcr.io/pterodactyl/yolks:java_21',
                'startup' => 'java -Xms128M -XX:MaxRAMPercentage=95.0 -jar {{SERVER_JARFILE}}',
                'env' => [
                    'BUNGEE_VERSION' => 'latest',
                    'SERVER_JARFILE' => 'bungeecord.jar',
                ],
            ],
            'fabric' => [
                'label' => 'Fabric',
                'egg_id' => 5,
                'docker_image' => 'ghcr.io/pterodactyl/yolks:java_21',
                'startup' => 'java -Xms128M -XX:MaxRAMPercentage=95.0 -jar {{SERVER_JARFILE}}',
                'env' => [
                    'MINECRAFT_VERSION' => 'latest',
                    'SERVER_JARFILE' => 'fabric.jar',
                    'FABRIC_VERSION' => 'latest',
                    'FABRIC_INSTALLER_VERSION' => 'latest',
                ],
            ],
            'sponge' => [
                'label' => 'Sponge (SpongeVanilla)',
                'egg_id' => 6,
                'docker_image' => 'ghcr.io/pterodactyl/yolks:java_21',
                'startup' => 'java -Xms128M -XX:MaxRAMPercentage=95.0 -jar {{SERVER_JARFILE}}',
                'env' => [
                    'SPONGE_VERSION' => '1.12.2-7.3.0',
                    'SERVER_JARFILE' => 'spongevanilla.jar',
                ],
            ],
            'forge' => [
                'label' => 'Forge',
                'egg_id' => 7,
                'docker_image' => 'ghcr.io/pterodactyl/yolks:java_21',
                'startup' => 'java -Xms128M -XX:MaxRAMPercentage=95.0 -Dterminal.jline=false -Dterminal.ansi=true $( [[  ! -f unix_args.txt ]] && printf %s "-jar {{SERVER_JARFILE}}" || printf %s "@unix_args.txt" )',
                'env' => [
                    'SERVER_JARFILE' => 'server.jar',
                    'MC_VERSION' => 'latest',
                    'BUILD_TYPE' => 'recommended',
                    'FORGE_VERSION' => '',
                ],
            ],
        ],
        'requires_db' => false,
    ],

    'counter_strike' => [
        'nest_id' => 2,
        'variants' => [
            'csgo' => [
                'label' => 'CS:GO',
                'egg_id' => 22,
                'docker_image' => 'ghcr.io/pterodactyl/games:source',
                'startup' => './srcds_run -game csgo -console -port {{SERVER_PORT}} +ip 0.0.0.0 +map {{SRCDS_MAP}} -strictportbind -norestart +sv_setsteamaccount {{STEAM_ACC}}',
                'env' => [
                    'SRCDS_MAP' => 'de_dust2',
                    'STEAM_ACC' => '00000000000000000000000000000000',
                    'SRCDS_APPID' => '740',
                ],
            ],
            'cs2' => [
                'label' => 'CS2',
                'egg_id' => 23,
                'docker_image' => 'docker.io/sples1/k4ryuu-cs2:latest',
                'startup' => './game/cs2.sh -dedicated +ip 0.0.0.0 -port {{SERVER_PORT}} +map {{SRCDS_MAP}} -maxplayers {{SRCDS_MAXPLAYERS}} +sv_setsteamaccount {{STEAM_ACC}}',
                'env' => [
                    'SRCDS_MAP' => 'de_dust2',
                    'SRCDS_APPID' => '730',
                    'SRCDS_MAXPLAYERS' => '64',
                    'SRCDS_STOP_UPDATE' => '0',
                    'SRCDS_VALIDATE' => '0',
                    'STEAM_ACC' => '',
                ],
            ],
        ],
        'requires_db' => false,
    ],

    'rust' => [
        'nest_id' => 2,
        'variants' => [
            'rust' => [
                'label' => 'Rust',
                'egg_id' => 21,
                'docker_image' => 'ghcr.io/pterodactyl/games:rust',
                'startup' => './RustDedicated -batchmode +server.port {{SERVER_PORT}} +server.queryport {{QUERY_PORT}} +server.identity "rust" +rcon.port {{RCON_PORT}} +rcon.web true +server.hostname \"{{HOSTNAME}}\" +server.level \"{{LEVEL}}\" +server.description \"{{DESCRIPTION}}\" +server.url \"{{SERVER_URL}}\" +server.headerimage \"{{SERVER_IMG}}\" +server.logoimage \"{{SERVER_LOGO}}\" +server.maxplayers {{MAX_PLAYERS}} +rcon.password \"{{RCON_PASS}}\" +server.saveinterval {{SAVEINTERVAL}} +app.port {{APP_PORT}}  $( [ -z ${MAP_URL} ] && printf %s "+server.worldsize \"{{WORLD_SIZE}}\" +server.seed \"{{WORLD_SEED}}\"" || printf %s "+server.levelurl {{MAP_URL}}" ) {{ADDITIONAL_ARGS}}',
                'env' => [
                    'HOSTNAME' => 'A QuarkHost.io Rust Server!',
                    'FRAMEWORK' => 'vanilla',
                    'LEVEL' => 'Procedural Map',
                    'DESCRIPTION' => 'Hosted on quarkhost.io | Get yours too!',
                    'SERVER_URL' => 'https://quarkhost.io',
                    'WORLD_SIZE' => '3000',
                    'WORLD_SEED' => '',
                    'MAX_PLAYERS' => '40',
                    'SERVER_IMG' => '',
                    'QUERY_PORT' => '27017',
                    'RCON_PORT' => '28016',
                    'RCON_PASS' => '123456789',
                    'SAVEINTERVAL' => '60 ',
                    'ADDITIONAL_ARGS' => '',
                    'APP_PORT' => '28082',
                    'SERVER_LOGO' => '',
                    'MAP_URL' => '',
                ],
            ],
        ],
        'requires_db' => false,
    ],
    'ark' => [
        'nest_id' => 2,
        'variants' => [
            'ark' => [
                'label' => 'ARK: Survival Ascended',
                'egg_id' => 11,
                'docker_image' => 'quay.io/parkervcp/pterodactyl-images:debian_source',
                'startup' => 'rmv() { echo -e "stopping server"; rcon -t rcon -a 127.0.0.1:${RCON_PORT} -p ${ARK_ADMIN_PASSWORD} -c saveworld && rcon -a 127.0.0.1:${RCON_PORT} -p ${ARK_ADMIN_PASSWORD} -c DoExit; }; trap rmv 15; cd ShooterGame/Binaries/Linux && ./ShooterGameServer {{SERVER_MAP}}?listen?SessionName="{{SESSION_NAME}}"?ServerPassword={{ARK_PASSWORD}}?ServerAdminPassword={{ARK_ADMIN_PASSWORD}}?Port={{SERVER_PORT}}?RCONPort={{RCON_PORT}}?QueryPort={{QUERY_PORT}}?RCONEnabled=True$( [ "$BATTLE_EYE" == "1" ] || printf %s \' -NoBattlEye\' ) -server {{ARGS}} -log & until echo "waiting for rcon connection..."; rcon -t rcon -a 127.0.0.1:${RCON_PORT} -p ${ARK_ADMIN_PASSWORD}; do sleep 5; done',
                'env' => [
                    'ARK_PASSWORD' => '',
                    'ARK_ADMIN_PASSWORD' => 'PleaseChangeMe',
                    'SERVER_MAP' => 'TheIsland',
                    'SESSION_NAME' => '{{SERVER_NAME}}',
                    'RCON_PORT' => '27020',
                    'QUERY_PORT' => '27015',
                    'AUTO_UPDATE' => '0',
                    'BATTLE_EYE' => '1',
                    'SRCDS_APPID' => '376030',
                    'ARGS' => '',
                ],
            ],
        ],
        'requires_db' => false,
    ],
    'gmod' => [
        'nest_id' => 2,
        'variants' => [
            'gmod' => [
                'label' => "Garry's Mod",
                'egg_id' => 13,
                'docker_image' => 'ghcr.io/pterodactyl/games:source',
                'startup' => './srcds_run -game garrysmod -console -port {{SERVER_PORT}} +ip 0.0.0.0 +host_workshop_collection {{WORKSHOP_ID}} +map {{SRCDS_MAP}} +gamemode {{GAMEMODE}} -strictportbind -norestart +sv_setsteamaccount {{STEAM_ACC}} +maxplayers {{MAX_PLAYERS}}  -tickrate {{TICKRATE}}  $( [ "$LUA_REFRESH" == "1" ] || printf %s \'-disableluarefresh\' )',
                'env' => [
                    'SRCDS_MAP' => 'gm_flatgrass',
                    'STEAM_ACC' => '',
                    'SRCDS_APPID' => '4020',
                    'WORKSHOP_ID' => '',
                    'GAMEMODE' => 'sandbox',
                    'MAX_PLAYERS' => '32',
                    'TICKRATE' => '22',
                    'LUA_REFRESH' => '0',
                ],
            ],
        ],
        'requires_db' => false,
    ],
    // 'valheim' => [
    //     'nest_id' => 2,
    //     'variants' => [
    //         'valheim' => [
    //             'label' => 'Valheim',
    //             'egg_id' => 34,
    //             'docker_image' => 'ghcr.io/pterodactyl/games:source',
    //             'startup' => './start.sh',
    //             'env' => [
    //                 'SERVER_NAME' => '{{SERVER_NAME}}',
    //                 'WORLD_NAME' => 'Dedicated',
    //                 'SERVER_PASS' => 'changeme',
    //             ],
    //         ],
    //     ],
    //     'requires_db' => false,
    // ]
];
