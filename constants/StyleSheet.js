import { COLORS, FONTS, SIZES } from "./theme";

export const GlobalStyleSheet = {
    container: {
        padding: 10,
        marginLeft: 'auto',
        marginRight: 'auto',
        width: '100%',
    },
    darkcontainer: {
        padding: 10,
        marginLeft: 'auto',
        marginRight: 'auto',
        width: '100%',
    },
    lightbg: {
        backgroundColor: COLORS.danger,
    },
    darkbg: {
        backgroundColor: COLORS.dark,
    },
    row: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    col20: {
        width: '20%',
    },
    col25: {
        width: '25%',
    },
    col30: {
        width: '30%',
    },
    col33: {
        width: '33.33%',
    },
    col40: {
        width: '40%',
    },
    col50: {
        width: '50%',
    },
    col60: {
        width: '60%',
    },
    col70: {
        width: '70%',
    },
    searchInput: {
        ...FONTS.font,
        height: 45,
        borderRadius: 10,
        paddingLeft: 18,
        paddingRight: 50,
    },
    searchInputIcon: {
        position: 'absolute',
        right: 5,
        height: 45,
        width: 45,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerArea: {
        borderBottomLeftRadius: 25,
        borderBottomRightRadius: 25,
        overflow: 'hidden',
        paddingHorizontal: 15,
        paddingTop: 12,
        paddingBottom: 50,
    },
    NotificationDot: {
        height: 20,
        width: 20,
        borderRadius: 10,
        backgroundColor: COLORS.primary,
        borderWidth: 1,
        position: 'absolute',
        top: -5,
        right: -5,
        borderColor: '#282828',
        alignItems: 'center',
        justifyContent: 'center',
    },
    NotificationBtn: {
        height: 45,
        width: 45,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 8,
        borderColor: 'rgba(255,255,255,.25)',
    },
    headerBtn: {
        height: 48,
        width: 48,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 10,
    },
    shadow: {
        shadowColor: "rgba(0,0,0,.5)",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.30,
        shadowRadius: 4.65,
        elevation: 8,
    },
    LightButton: {
        borderRadius: SIZES.radius,
        backgroundColor: COLORS.white,
        height: 50,
        alignItems: "center",
        justifyContent: "center",
    },
    DarkButton: {
        borderRadius: SIZES.radius,
        backgroundColor: COLORS.dark,
        height: 50,
        alignItems: "center",
        justifyContent: "center",
    },
}