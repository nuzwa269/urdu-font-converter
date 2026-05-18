<?php
/**
 * Plugin Name: Urdu Tools — Nastaleeq + Font Converter
 * Plugin URI:  https://urdu-font-converter.lovable.app
 * Description: اردو نستعلیق فلوٹنگ ٹول اور Urdu Font Converter (shortcode/block) ایک ہی پلگ ان میں۔
 * Version:     1.0.0
 * Author:      Urdu Tools
 * Text Domain: urdu-tools
 * Domain Path: /languages
 * License:     GPLv2 or later
 * Requires PHP: 7.4
 * Requires at least: 6.0
 */

if ( ! defined( 'ABSPATH' ) ) { exit; }

define( 'URDU_TOOLS_VERSION', '1.0.0' );
define( 'URDU_TOOLS_FILE', __FILE__ );
define( 'URDU_TOOLS_DIR', plugin_dir_path( __FILE__ ) );
define( 'URDU_TOOLS_URL', plugin_dir_url( __FILE__ ) );

require_once URDU_TOOLS_DIR . 'includes/class-settings.php';
require_once URDU_TOOLS_DIR . 'includes/class-shortcode.php';
require_once URDU_TOOLS_DIR . 'includes/class-block.php';

add_action( 'plugins_loaded', function () {
    load_plugin_textdomain( 'urdu-tools', false, dirname( plugin_basename( __FILE__ ) ) . '/languages' );
    Urdu_Tools_Settings::instance();
    Urdu_Tools_Shortcode::instance();
    Urdu_Tools_Block::instance();
} );

// Inject Nastaleeq floating tool on frontend if enabled
add_action( 'wp_enqueue_scripts', function () {
    $opts = get_option( 'urdu_tools_options', array() );
    if ( empty( $opts['nastaleeq_enabled'] ) ) { return; }

    // Audience: all | logged_in
    $audience = isset( $opts['nastaleeq_audience'] ) ? $opts['nastaleeq_audience'] : 'all';
    if ( 'logged_in' === $audience && ! is_user_logged_in() ) { return; }

    // Where: all | posts | pages
    $where = isset( $opts['nastaleeq_where'] ) ? $opts['nastaleeq_where'] : 'all';
    if ( 'posts' === $where && ! is_single() ) { return; }
    if ( 'pages' === $where && ! is_page() ) { return; }

    wp_enqueue_script(
        'urdu-tools-nastaleeq',
        URDU_TOOLS_URL . 'assets/nastaleeq.js',
        array(),
        URDU_TOOLS_VERSION,
        true
    );

    // Pre-seed defaults via inline script (only first load — script respects existing localStorage)
    $defaults = array(
        'size'       => isset( $opts['default_size'] ) ? (int) $opts['default_size'] : 100,
        'lineHeight' => isset( $opts['default_line_height'] ) ? (int) $opts['default_line_height'] : 200,
        'weight'     => isset( $opts['default_weight'] ) ? (int) $opts['default_weight'] : 400,
    );
    wp_add_inline_script(
        'urdu-tools-nastaleeq',
        'window.__NASTALEEQ_DEFAULTS__ = ' . wp_json_encode( $defaults ) . ';',
        'before'
    );
} );