type Nullable<T> = T | null;
type TMode = "noise" | "off";
interface IOptions {
    version: number;
    doNotTrack: boolean;
    dns: string;
    screen: Nullable<string>;
    webrtc: {
        mode: "alerted" | "disabled" | "real";
        fillBasedOnIP: boolean;
    };
    timezone: {
        fillBasedOnIP: boolean;
        id: string;
    };
    location: {
        fillBasedOnIP: boolean;
        mode: "prompt" | "allow" | "block";
        latitude: number;
        longitude: number;
        accuracy: number;
    };
    language: {
        autoLang: boolean;
        value: string;
    };
    canvas: {
        mode: TMode;
    };
    clientRects: {
        mode: TMode;
    };
    audioContext: {
        mode: TMode;
    };
    mediaDevices: {
        mode: TMode;
    };
    webGL: {
        mode: TMode;
    };
    webGLMetadata: {
        mode: "mask" | "off";
        vendor: string;
        renderer: string;
    };
    fonts: {
        mode: TMode;
    };
}
interface IProfile {
    name?: string;
    proxy: IProxy;
    proxyInfo?: Nullable<ICheckProxyResult>;
}
interface ISpawnArgs {
    userDataDir: string;
    remoteDebuggingPort?: number;
}

interface IProxyService {
    name: string;
    url: string;
    extract: (data: any) => ICheckProxyResult;
}
interface IProxy {
    protocol: Nullable<'http' | 'socks'>;
    host: string;
    port: number;
    username: string;
    password: string;
}
interface ICheckProxyResult {
    ip: string;
    country: string;
    timezone: string;
    latitude: string;
    longitude: string;
    accuracy: Nullable<number>;
}
declare const PROXY_SERVICES: IProxyService[];
declare const extractProxyInfo: (proxy: IProxy, serviceChecker: IProxyService, timeout?: number) => Promise<Nullable<ICheckProxyResult>>;
declare const checkProxy: (proxy: IProxy, timeout?: number) => Promise<ICheckProxyResult | null>;

declare const getNewFingerprint: (payload: IProfile, opts?: Partial<IOptions>) => {
    gologin: {
        profile_id: string;
        name: string;
        is_m1: boolean;
        geoLocation: {
            mode: string;
            latitude: number;
            longitude: number;
            accuracy: number;
        };
        navigator: {
            platform: string;
            max_touch_points: number;
        };
        dns: string;
        proxy: {
            username: string;
            password: string;
        };
        screenHeight: number;
        screenWidth: number;
        userAgent: string;
        webGl: {
            vendor: string;
            renderer: string;
            mode: boolean;
        };
        webgl: {
            metadata: {
                vendor: string;
                renderer: string;
                mode: boolean;
            };
        };
        mobile: {
            enable: boolean;
            width: number;
            height: number;
            device_scale_factor: number;
        };
        webglParams: {
            glCanvas: string;
            supportedFunctions: {
                name: string;
                supported: boolean;
            }[];
            glParamValues: ({
                name: string;
                value: {
                    "0": number;
                    "1": number;
                };
            } | {
                name: string[];
                value: string;
            } | {
                name: string;
                value: number;
            } | {
                name: string;
                value: string;
            })[];
            antialiasing: boolean;
            textureMaxAnisotropyExt: number;
            shaiderPrecisionFormat: string;
            extensions: string[];
        };
        webgl_noice_enable: boolean;
        webglNoiceEnable: boolean;
        webgl_noise_enable: boolean;
        webgl_noise_value: number;
        webglNoiseValue: number;
        getClientRectsNoice: number;
        get_client_rects_noise: number;
        client_rects_noise_enable: boolean;
        mediaDevices: {
            enable: boolean;
            uid: string;
            audioInputs: number;
            audioOutputs: number;
            videoInputs: number;
        };
        doNotTrack: boolean;
        plugins: {
            all_enable: boolean;
            flash_enable: boolean;
        };
        storage: {
            enable: boolean;
        };
        audioContext: {
            enable: boolean;
            noiseValue: number;
        };
        languages: string;
        langHeader: string;
        canvasMode: string;
        canvasNoise: number;
        hardwareConcurrency: number;
        deviceMemory: number;
        startupUrl: string;
        startup_urls: string[];
        icon: {
            avatar: {
                enabled: boolean;
                windows_icons: {
                    "32": string;
                };
            };
        };
        timezone: {
            id: string;
        };
        unpinable_extension_names: string[];
        webrtc: {
            enable: boolean;
            should_fill_empty_ice_list: boolean;
            mode: string;
        };
    };
    NewTabPage: {
        PrevNavigationTime: string;
    };
    account_id_migration_state: number;
    account_tracker_service_last_update: string;
    ack_existing_ntp_extensions: boolean;
    alternate_error_pages: {
        backup: boolean;
    };
    apps: {};
    autocomplete: {
        retention_policy_last_version: number;
    };
    autofill: {
        orphan_rows_removed: boolean;
    };
    bookmark_bar: {
        show_on_all_tabs: boolean;
    };
    browser: {
        has_seen_welcome_page: boolean;
        window_placement: {
            bottom: number;
            left: number;
            maximized: boolean;
            right: number;
            top: number;
            work_area_bottom: number;
            work_area_left: number;
            work_area_right: number;
            work_area_top: number;
        };
    };
    countryid_at_install: number;
    custom_links: {
        initialized: boolean;
        list: {
            isMostVisited: boolean;
            title: string;
            url: string;
        }[];
    };
    default_apps_install_state: number;
    domain_diversity: {
        last_reporting_timestamp: string;
    };
    extensions: {
        alerts: {
            initialized: boolean;
        };
        chrome_url_overrides: {};
        last_chrome_version: string;
        settings: {};
        block_external_extensions: boolean;
    };
    gaia_cookie: {
        changed_time: number;
        hash: string;
        last_list_accounts_data: string;
    };
    gcm: {
        product_category_for_subtypes: string;
    };
    google: {
        services: {
            signin_scoped_device_id: string;
        };
    };
    intl: {
        selected_languages: string;
    };
    invalidation: {
        per_sender_topics_to_handler: {
            "1013309121859": {};
            "8181035976": {};
        };
    };
    media: {
        device_id_salt: string;
        engagement: {
            schema_version: number;
        };
    };
    media_router: {
        receiver_id_hash_token: string;
    };
    ntp: {
        num_personal_suggestions: number;
    };
    optimization_guide: {
        previously_registered_optimization_types: {
            ABOUT_THIS_SITE: boolean;
            HISTORY_CLUSTERS: boolean;
        };
        store_file_paths_to_delete: {};
    };
    plugins: {
        plugins_list: never[];
    };
    privacy_sandbox: {
        preferences_reconciled: boolean;
    };
    profile: {
        avatar_bubble_tutorial_shown: number;
        avatar_index: number;
        content_settings: {
            enable_quiet_permission_ui_enabling_method: {
                notifications: number;
            };
            exceptions: {
                accessibility_events: {};
                app_banner: {};
                ar: {};
                auto_select_certificate: {};
                automatic_downloads: {};
                autoplay: {};
                background_sync: {};
                bluetooth_chooser_data: {};
                bluetooth_guard: {};
                bluetooth_scanning: {};
                camera_pan_tilt_zoom: {};
                client_hints: {};
                clipboard: {};
                cookies: {};
                durable_storage: {};
                fedcm_active_session: {};
                fedcm_share: {};
                file_system_access_chooser_data: {};
                file_system_last_picked_directory: {};
                file_system_read_guard: {};
                file_system_write_guard: {};
                formfill_metadata: {};
                geolocation: {};
                get_display_media_set_select_all_screens: {};
                hid_chooser_data: {};
                hid_guard: {};
                http_allowed: {};
                idle_detection: {};
                images: {};
                important_site_info: {};
                insecure_private_network: {};
                installed_web_app_metadata: {};
                intent_picker_auto_display: {};
                javascript: {};
                javascript_jit: {};
                legacy_cookie_access: {};
                local_fonts: {};
                media_engagement: {};
                media_stream_camera: {};
                media_stream_mic: {};
                midi_sysex: {};
                mixed_script: {};
                nfc_devices: {};
                notifications: {};
                password_protection: {};
                payment_handler: {};
                permission_autoblocking_data: {};
                permission_autorevocation_data: {};
                popups: {};
                ppapi_broker: {};
                protocol_handler: {};
                safe_browsing_url_check_data: {};
                sensors: {};
                serial_chooser_data: {};
                serial_guard: {};
                site_engagement: {};
                sound: {};
                ssl_cert_decisions: {};
                storage_access: {};
                subresource_filter: {};
                subresource_filter_data: {};
                usb_chooser_data: {};
                usb_guard: {};
                vr: {};
                webid_api: {};
                window_placement: {};
            };
            pref_version: number;
        };
        created_by_version: string;
        creation_time: string;
        exit_type: string;
        last_engagement_time: string;
        last_time_password_store_metrics_reported: number;
        managed_user_id: string;
        name: string;
        password_account_storage_settings: {};
    };
    safebrowsing: {
        event_timestamps: {};
        metrics_last_log_time: string;
    };
    signin: {
        allowed: boolean;
    };
    sync: {
        requested: boolean;
    };
    translate_site_blacklist: never[];
    translate_site_blacklist_with_time: {};
    unified_consent: {
        migration_state: number;
    };
    web_apps: {
        system_web_app_failure_count: number;
        system_web_app_last_attempted_language: string;
        system_web_app_last_attempted_update: string;
        system_web_app_last_installed_language: string;
        system_web_app_last_update: string;
    };
    webauthn: {
        touchid: {
            metadata_secret: string;
        };
    };
    bookmarks: {
        editing_enabled: boolean;
    };
    history: {
        saving_disabled: boolean;
    };
    credentials_enable_service: boolean;
};
declare const spawnArgs: (options: ISpawnArgs, payload: IProfile, args?: string[]) => string[];
declare const writePrefs: (userDataDir: string, prefs: any) => Promise<void>;

declare const randomInt: (min: number, max: number) => number;
declare const randomFloat: (min: number, max: number) => number;
declare const randomUID: (length?: number) => string;
declare const randomItem: <T>(items: T[]) => T;
declare const randomWebGL: () => {
    mode: boolean;
    renderer: string;
    vendor: string;
};

declare const screens: string[];
declare const hwConcurrency: number[];
declare const deviceMemory: number[];
declare const userAgents: {
    [k in string]: string;
};
declare const generateUserAgent: (version: number) => string;

export { type ICheckProxyResult, type IOptions, type IProfile, type IProxy, type IProxyService, type ISpawnArgs, type Nullable, PROXY_SERVICES, checkProxy, deviceMemory, extractProxyInfo, generateUserAgent, getNewFingerprint, hwConcurrency, randomFloat, randomInt, randomItem, randomUID, randomWebGL, screens, spawnArgs, userAgents, writePrefs };
