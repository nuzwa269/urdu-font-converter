<?php
if ( ! defined( 'ABSPATH' ) ) { exit; }

class Urdu_Tools_Block {
    private static $instance = null;
    public static function instance() {
        if ( null === self::$instance ) self::$instance = new self();
        return self::$instance;
    }
    private function __construct() {
        add_action( 'init', array( $this, 'register' ) );
    }
    public function register() {
        if ( ! function_exists( 'register_block_type' ) ) return;
        register_block_type( 'urdu-tools/converter', array(
            'api_version'     => 2,
            'title'           => __( 'Urdu Font Converter', 'urdu-tools' ),
            'category'        => 'widgets',
            'icon'            => 'editor-textcolor',
            'description'     => __( 'اردو متن کو مختلف نستعلیق فونٹس میں دیکھیں اور PNG ڈاؤن لوڈ کریں۔', 'urdu-tools' ),
            'supports'        => array( 'html' => false ),
            'attributes'      => array(
                'brand' => array( 'type' => 'string', 'default' => '' ),
            ),
            'render_callback' => array( $this, 'render' ),
        ) );
    }
    public function render( $attrs ) {
        $brand = isset( $attrs['brand'] ) ? sanitize_text_field( $attrs['brand'] ) : '';
        return Urdu_Tools_Shortcode::instance()->render( array( 'brand' => $brand ) );
    }
}