<?php

return [
    'page_gate_hash' => env('PAGE_GATE_PIN_HASH', ''),
    'page_gate_hashes' => [
        'credentials' => env('PAGE_GATE_PIN_HASH_CREDENTIALS', ''),
        'monitoring' => env('PAGE_GATE_PIN_HASH_MONITORING', ''),
        'analytics' => env('PAGE_GATE_PIN_HASH_ANALYTICS', ''),
    ],
];
