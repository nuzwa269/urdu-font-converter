<?php
if ( ! defined( 'ABSPATH' ) ) { exit; }

class Urdu_Tools_Settings {
    const OPTION = 'urdu_tools_options';
    private static $instance = null;
    public static function instance() {
        if ( null === self::$instance ) self::$instance = new self();
        return self::$instance;
    }
    private function __construct() {
        add_action( 'admin_menu', array( $this, 'menu' ) );
        add_action( 'admin_init', array( $this, 'register' ) );
    }
    public function defaults() {
        return array(
            'nastaleeq_enabled'   => 1,
            'nastaleeq_audience'  => 'all',
            'nastaleeq_where'     => 'all',
            'default_size'        => 100,
            'default_line_height' => 200,
            'default_weight'      => 400,
            'converter_brand'     => '',
        );
    }
    public function get( $key ) {
        $opts = wp_parse_args( get_option( self::OPTION, array() ), $this->defaults() );
        return isset( $opts[ $key ] ) ? $opts[ $key ] : null;
    }
    public function menu() {
        add_options_page(
            __( 'Urdu Tools', 'urdu-tools' ),
            __( 'اردو ٹولز', 'urdu-tools' ),
            'manage_options',
            'urdu-tools',
            array( $this, 'render' )
        );
    }
    public function register() {
        register_setting( 'urdu_tools_group', self::OPTION, array(
            'type'              => 'array',
            'sanitize_callback' => array( $this, 'sanitize' ),
            'default'           => $this->defaults(),
        ) );
    }
    public function sanitize( $input ) {
        $d = $this->defaults();
        $out = array();
        $out['nastaleeq_enabled']   = ! empty( $input['nastaleeq_enabled'] ) ? 1 : 0;
        $out['nastaleeq_audience']  = in_array( ( $input['nastaleeq_audience'] ?? '' ), array( 'all', 'logged_in' ), true ) ? $input['nastaleeq_audience'] : 'all';
        $out['nastaleeq_where']     = in_array( ( $input['nastaleeq_where'] ?? '' ), array( 'all', 'posts', 'pages' ), true ) ? $input['nastaleeq_where'] : 'all';
        $out['default_size']        = max( 80, min( 220, (int) ( $input['default_size'] ?? $d['default_size'] ) ) );
        $out['default_line_height'] = max( 120, min( 320, (int) ( $input['default_line_height'] ?? $d['default_line_height'] ) ) );
        $out['default_weight']      = max( 300, min( 800, (int) ( $input['default_weight'] ?? $d['default_weight'] ) ) );
        $out['converter_brand']     = sanitize_text_field( $input['converter_brand'] ?? '' );
        return $out;
    }
    public function render() {
        if ( ! current_user_can( 'manage_options' ) ) return;
        $opts = wp_parse_args( get_option( self::OPTION, array() ), $this->defaults() );
        ?>
        <div class="wrap" dir="rtl" style="text-align:right;max-width:780px">
            <h1><?php esc_html_e( 'اردو ٹولز کی ترتیبات', 'urdu-tools' ); ?></h1>
            <p style="color:#555">
                <?php esc_html_e( 'یہ پلگ ان دو ٹولز فراہم کرتا ہے: (1) فلوٹنگ نستعلیق ٹول جو پوری سائٹ پر فعال ہوتا ہے، (2) Urdu Font Converter جسے آپ shortcode سے کسی بھی پیج میں شامل کر سکتے ہیں۔', 'urdu-tools' ); ?>
            </p>
            <form method="post" action="options.php">
                <?php settings_fields( 'urdu_tools_group' ); ?>
                <h2><?php esc_html_e( 'نستعلیق فلوٹنگ ٹول', 'urdu-tools' ); ?></h2>
                <table class="form-table" role="presentation">
                    <tr>
                        <th scope="row"><?php esc_html_e( 'فعال کریں', 'urdu-tools' ); ?></th>
                        <td>
                            <label>
                                <input type="checkbox" name="urdu_tools_options[nastaleeq_enabled]" value="1" <?php checked( $opts['nastaleeq_enabled'], 1 ); ?> />
                                <?php esc_html_e( 'سائٹ کے فرنٹ‌اینڈ پر فلوٹنگ بٹن دکھائیں', 'urdu-tools' ); ?>
                            </label>
                        </td>
                    </tr>
                    <tr>
                        <th scope="row"><?php esc_html_e( 'سامعین', 'urdu-tools' ); ?></th>
                        <td>
                            <select name="urdu_tools_options[nastaleeq_audience]">
                                <option value="all" <?php selected( $opts['nastaleeq_audience'], 'all' ); ?>><?php esc_html_e( 'تمام وزٹرز', 'urdu-tools' ); ?></option>
                                <option value="logged_in" <?php selected( $opts['nastaleeq_audience'], 'logged_in' ); ?>><?php esc_html_e( 'صرف لاگ ان یوزرز', 'urdu-tools' ); ?></option>
                            </select>
                        </td>
                    </tr>
                    <tr>
                        <th scope="row"><?php esc_html_e( 'کہاں دکھائیں', 'urdu-tools' ); ?></th>
                        <td>
                            <select name="urdu_tools_options[nastaleeq_where]">
                                <option value="all" <?php selected( $opts['nastaleeq_where'], 'all' ); ?>><?php esc_html_e( 'پوری سائٹ', 'urdu-tools' ); ?></option>
                                <option value="posts" <?php selected( $opts['nastaleeq_where'], 'posts' ); ?>><?php esc_html_e( 'صرف پوسٹس', 'urdu-tools' ); ?></option>
                                <option value="pages" <?php selected( $opts['nastaleeq_where'], 'pages' ); ?>><?php esc_html_e( 'صرف پیجز', 'urdu-tools' ); ?></option>
                            </select>
                        </td>
                    </tr>
                    <tr>
                        <th scope="row"><?php esc_html_e( 'ڈیفالٹ فونٹ سائز (%)', 'urdu-tools' ); ?></th>
                        <td><input type="number" min="80" max="220" step="5" name="urdu_tools_options[default_size]" value="<?php echo esc_attr( $opts['default_size'] ); ?>" /></td>
                    </tr>
                    <tr>
                        <th scope="row"><?php esc_html_e( 'ڈیفالٹ لائن ہائٹ (%)', 'urdu-tools' ); ?></th>
                        <td><input type="number" min="120" max="320" step="10" name="urdu_tools_options[default_line_height]" value="<?php echo esc_attr( $opts['default_line_height'] ); ?>" /></td>
                    </tr>
                    <tr>
                        <th scope="row"><?php esc_html_e( 'ڈیفالٹ فونٹ وزن', 'urdu-tools' ); ?></th>
                        <td><input type="number" min="300" max="800" step="100" name="urdu_tools_options[default_weight]" value="<?php echo esc_attr( $opts['default_weight'] ); ?>" /></td>
                    </tr>
                </table>

                <h2><?php esc_html_e( 'Urdu Font Converter', 'urdu-tools' ); ?></h2>
                <p>
                    <?php
                    printf(
                        /* translators: %s: shortcode */
                        esc_html__( 'کسی بھی پوسٹ یا پیج میں یہ شارٹ‌کوڈ ڈالیں: %s', 'urdu-tools' ),
                        '<code>[urdu_converter]</code>'
                    );
                    ?>
                </p>
                <table class="form-table" role="presentation">
                    <tr>
                        <th scope="row"><?php esc_html_e( 'ڈیفالٹ برانڈ/نام', 'urdu-tools' ); ?></th>
                        <td>
                            <input type="text" maxlength="60" dir="rtl" style="width:300px" name="urdu_tools_options[converter_brand]" value="<?php echo esc_attr( $opts['converter_brand'] ); ?>" placeholder="<?php esc_attr_e( 'مثلاً: آپ کی ویب سائٹ', 'urdu-tools' ); ?>" />
                            <p class="description"><?php esc_html_e( 'اختیاری — یوزر تبدیل کر سکتا ہے۔', 'urdu-tools' ); ?></p>
                        </td>
                    </tr>
                </table>

                <?php submit_button( __( 'محفوظ کریں', 'urdu-tools' ) ); ?>
            </form>
        </div>
        <?php
    }
}