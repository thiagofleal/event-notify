const Generator = {
    randomString(length) {
        let ret = "";
        const chars = "AaBbCcDdEeFfGgHhIiJjKkLlMmNnOoPpQqRrSsTtUuVvWwXxYyZz0123456789";

        while (length--) {
            ret += chars.charAt(Math.floor(Math.random() * (chars.length - 1)));
        }
        return ret;
    }
};

module.exports = Generator;