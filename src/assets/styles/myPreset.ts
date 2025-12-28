// aura-purple-primary.preset.ts
import { definePreset } from '@primevue/themes';
import Aura from '@primevue/themes/aura';

export const AuraPurplePrimary = definePreset(Aura, {
    semantic: {
        /* ---------------- PRIMARY (Purple #a85eee) ---------------- */
        primary: {
            50:  '#f4ecfd',
            100: '#e6d5fb',
            200: '#d4b8f7',
            300: '#c099f2',
            400: '#b07eef',
            500: '#a85eee', // основной цвет
            600: '#9448d6',
            700: '#7e39b8',
            800: '#672c97',
            900: '#4e1f73'
        },

        /* ---------------- SECONDARY (Neutral Gray) ---------------- */
        secondary: {
            50:  '#fafafa',
            100: '#f5f5f5',
            200: '#eeeeee',
            300: '#e0e0e0',
            400: '#bdbdbd',
            500: '#9e9e9e',
            600: '#757575',
            700: '#616161',
            800: '#424242',
            900: '#212121'
        },

        /* ---------------- SUCCESS ---------------- */
        success: {
            50:  '#e9f7ef',
            100: '#c8eedc',
            200: '#a6e4c8',
            300: '#7fd9b1',
            400: '#55cd97',
            500: '#2fbf7f',
            600: '#26a06b',
            700: '#1d8055',
            800: '#145f3f',
            900: '#0b3e2a'
        },

        /* ---------------- DANGER ---------------- */
        danger: {
            50:  '#fdecec',
            100: '#f9caca',
            200: '#f4a7a7',
            300: '#ef7f7f',
            400: '#e95a5a',
            500: '#e03535',
            600: '#c12d2d',
            700: '#9f2424',
            800: '#7c1b1b',
            900: '#561212'
        },

        /* ---------------- COLOR SCHEMES ---------------- */
        colorScheme: {
            /* ---------- LIGHT ---------- */
            light: {
                surface: {
                    0: '#ffffff',
                    50: '#fafafa',
                    100: '#f5f5f5',
                    200: '#eeeeee',
                    300: '#e0e0e0',
                    400: '#bdbdbd',
                    500: '#9e9e9e',
                    600: '#757575',
                    700: '#616161',
                    800: '#424242',
                    900: '#212121',
                    950: '#000000'
                },

                primary: {
                    color: '{primary.500}',
                    contrastColor: '#ffffff',
                    hoverColor: '{primary.400}',
                    activeColor: '{primary.600}'
                },

                highlight: {
                    background: '{primary.50}',
                    focusBackground: '{primary.100}',
                    color: '{primary.900}',
                    focusColor: '{primary.900}'
                }
            },

            /* ---------- DARK ---------- */
            dark: {
                surface: {
                    0: '#000000',
                    50: '#0d0d0d',
                    100: '#141414',
                    200: '#1e1e1e',
                    300: '#282828',
                    400: '#323232',
                    500: '#3c3c3c',
                    600: '#464646',
                    700: '#505050',
                    800: '#5a5a5a',
                    900: '#6a6a6a',
                    950: '#ffffff'
                },

                primary: {
                    color: '{primary.400}',
                    contrastColor: '#ffffff',
                    hoverColor: '{primary.300}',
                    activeColor: '{primary.500}'
                },

                highlight: {
                    background: '{primary.900}',
                    focusBackground: '{primary.800}',
                    color: '{primary.200}',
                    focusColor: '{primary.200}'
                }
            }
        }
    },

    /* ---------------- COMPONENTS ---------------- */
    components: {
        button: {
            root: {
                borderRadius: '1rem',
                fontWeight: '500'
            },
            primary: {
                background: '{primary.500}', // #a85eee
                color: '#ffffff',
                borderColor: '{primary.500}',
                hoverBackground: '{primary.400}',
                activeBackground: '{primary.600}'
            },
            secondary: {
                background: 'transparent',
                color: '{secondary.700}',
                borderColor: '{secondary.300}',
                hoverBackground: '{secondary.100}'
            },
            success: {
                background: '{success.500}',
                color: '#ffffff'
            },
            danger: {
                background: '{danger.500}',
                color: '#ffffff'
            }
        },

        inputtext: {
            root: { borderRadius: '6px' },
            background: '{surface.0}',
            color: '{surface.950}',
            borderColor: '{secondary.300}',
            hoverBorderColor: '{primary.400}',
            focusBorderColor: '{primary.500}',
            focusRing: {
                width: '1px',
                style: 'solid',
                color: '{primary.400}',
                offset: '1px'
            }
        },

        checkbox: {
            borderColor: '{secondary.400}',
            hoverBorderColor: '{primary.400}',
            checkedBackground: '{primary.500}',
            checkedBorderColor: '{primary.500}',
            checkIconColor: '#ffffff'
        },

        radiobutton: {
            borderColor: '{secondary.400}',
            hoverBorderColor: '{primary.400}',
            checkedBackground: '{primary.500}',
            checkIconColor: '#ffffff'
        },

        divider: {
            color: '{secondary.200}'
        },

        card: {
            root: { borderRadius: '8px' },
            background: '{surface.0}',
            color: '{surface.950}',
            borderColor: '{secondary.100}'
        },

        tabs: {
            tablist: {
                borderColor: '{secondary.200}'
            },
            tab: {
                hoverBorderColor: '{primary.400}',
                activeBorderColor: '{primary.500}'
            }
        },

        progressbar: {
            background: '{secondary.100}',
            value: { background: '{primary.500}' }
        },

        slider: {
            track: { background: '{secondary.200}' },
            range: { background: '{primary.500}' },
            handle: {
                background: '{primary.500}',
                borderColor: '{primary.500}'
            }
        },

        badge: {
            background: '{primary.500}',
            color: '#ffffff'
        }
    },

    /* ---------------- OPTIONS ---------------- */
    options: {
        darkModeSelector: '.dark',
        cssLayer: {
            name: 'primevue',
            order: 'theme, base, components'
        }
    }
});
