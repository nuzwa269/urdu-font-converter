<?php
if ( ! defined( 'ABSPATH' ) ) { exit; }

class Urdu_Tools_Shortcode {
    private static $instance = null;
    public static function instance() {
        if ( null === self::$instance ) self::$instance = new self();
        return self::$instance;
    }
    private $assets_enqueued = false;
    private function __construct() {
        add_shortcode( 'urdu_converter', array( $this, 'render' ) );
    }
    public function render( $atts = array() ) {
        $atts = shortcode_atts( array(
            'brand' => '',
        ), $atts, 'urdu_converter' );

        $this->enqueue();

        $opts = wp_parse_args( get_option( 'urdu_tools_options', array() ), Urdu_Tools_Settings::instance()->defaults() );
        $default_brand = $atts['brand'] !== '' ? $atts['brand'] : ( $opts['converter_brand'] ?? '' );

        $config = array(
            'defaultBrand' => $default_brand,
        );

        $id = 'urdu-converter-' . wp_unique_id();

        ob_start();
        ?>
        <div id="<?php echo esc_attr( $id ); ?>" class="urdu-converter-root" dir="rtl"></div>
        <script>
        (function(){
            var init = function(){
                if (window.UrduConverter && window.UrduConverter.mount) {
                    window.UrduConverter.mount(<?php echo wp_json_encode( $id ); ?>, <?php echo wp_json_encode( $config ); ?>);
                } else {
                    setTimeout(init, 60);
                }
            };
            init();
        })();
        </script>
        <?php
        return ob_get_clean();
    }
    public function enqueue() {
        if ( $this->assets_enqueued ) return;
        $this->assets_enqueued = true;
        wp_enqueue_style(
            'urdu-converter',
            URDU_TOOLS_URL . 'assets/converter.css',
            array(),
            URDU_TOOLS_VERSION
        );
        wp_enqueue_script(
            'html2canvas',
            'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js',
            array(),
            '1.4.1',
            true
        );
        wp_enqueue_script(
            'urdu-converter',
            URDU_TOOLS_URL . 'assets/converter.js',
            array( 'html2canvas' ),
            URDU_TOOLS_VERSION,
            true
        );
    }
}
