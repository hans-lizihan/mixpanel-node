const Mixpanel = require('../lib/mixpanel-node');
const {create_group_funcs} = require('../lib/groups');
const {create_profile_helpers} = require('../lib/profile_helpers');



describe("groups", () => {
    const endpoint = '/groups';
    const group_key = 'company';
    const group_id = 'Acme Inc.';
    const token = 'token';
    let send_request;
    let mixpanel;
    beforeEach(() => {
        send_request = vi.fn();

        mixpanel = Mixpanel.init(token);
        mixpanel.send_request = send_request;
    });

    // shared test case
    const test_send_request_args = function(func, {args, expected, use_modifiers, use_callback} = {}) {
        let expected_data = {$token: token, $group_key: group_key, $group_id: group_id, ...expected};
        let callback;

        args = [group_key, group_id, ...(args ? args : [])];

        if (use_modifiers) {
            let modifiers = {
                '$ignore_alias': true,
                '$ignore_time': true,
                '$ip': '1.2.3.4',
                '$time': 1234567890
            };
            Object.assign(expected_data, modifiers);
            args.push(modifiers);
        }
        if (use_callback) {
            callback = function() {};
            args.push(callback);
        }

        mixpanel.groups[func](...args);

        const expectedSendRequestArgs = [
            { method: 'GET', endpoint, data: expected_data },
            use_callback ? callback : undefined,
        ];
        expect(send_request).toHaveBeenCalledWith(...expectedSendRequestArgs)
    };

    describe("_set", () => {
        it("handles set_once correctly", () => {
            test_send_request_args('set_once', {
                args: ['key1', 'val1'],
                expected: {$set_once: {'key1': 'val1'}},
            });
        });

        it("calls send_request with correct endpoint and data", () => {
            test_send_request_args('set', {
                args: ['key1', 'val1'],
                expected: {$set: {'key1': 'val1'}},
            });
        });

        it("supports being called with a property object", () => {
            test_send_request_args('set', {
                args: [{'key1': 'val1', 'key2': 'val2'}],
                expected: {$set: {'key1': 'val1', 'key2': 'val2'}},
            });
        });

        it("supports being called with a property object (set_once)", () => {
            test_send_request_args('set_once', {
                args: [{'key1': 'val1', 'key2': 'val2'}],
                expected: {$set_once: {'key1': 'val1', 'key2': 'val2'}},
            });
        });

        it("supports being called with a modifiers argument", () => {
            test_send_request_args('set', {
                args: ['key1', 'val1'],
                expected: {$set: {'key1': 'val1'}},
                use_modifiers: true,
            });
        });

        it("supports being called with a modifiers argument (set_once)", () => {
            test_send_request_args('set_once', {
                args: ['key1', 'val1'],
                expected: {$set_once: {'key1': 'val1'}},
                use_modifiers: true,
            });
        });

        it("supports being called with a properties object and a modifiers argument", () => {
            test_send_request_args('set', {
                args: [{'key1': 'val1', 'key2': 'val2'}],
                expected: {$set: {'key1': 'val1', 'key2': 'val2'}},
                use_modifiers: true,
            });
        });

        it("supports being called with a properties object and a modifiers argument (set_once)", () => {
            test_send_request_args('set_once', {
                args: [{'key1': 'val1', 'key2': 'val2'}],
                expected: {$set_once: {'key1': 'val1', 'key2': 'val2'}},
                use_modifiers: true,
            });
        });

        it("handles the ip property in a property object properly", () => {
            test_send_request_args('set', {
                args: [{'ip': '1.2.3.4', 'key1': 'val1', 'key2': 'val2'}],
                expected: {
                    $ip: '1.2.3.4',
                    $set: {'key1': 'val1', 'key2': 'val2'},
                },
            });
        });

        it("handles the $ignore_time property in a property object properly", () => {
            test_send_request_args('set', {
                args: [{'$ignore_time': true, 'key1': 'val1', 'key2': 'val2'}],
                expected: {
                    $ignore_time: true,
                    $set: {'key1': 'val1', 'key2': 'val2'},
                },
            });
        });

        it("supports being called with a callback", () => {
            test_send_request_args('set', {
                args: ['key1', 'val1'],
                expected: {$set: {'key1': 'val1'}},
                use_callback: true,
            });
        });

        it("supports being called with a callback (set_once)", () => {
            test_send_request_args('set_once', {
                args: ['key1', 'val1'],
                expected: {$set_once: {'key1': 'val1'}},
                use_callback: true,
            });
        });

        it("supports being called with a properties object and a callback", () => {
            test_send_request_args('set', {
                args: [{'key1': 'val1', 'key2': 'val2'}],
                expected: {$set: {'key1': 'val1', 'key2': 'val2'}},
                use_callback: true,
            });
        });

        it("supports being called with a properties object and a callback (set_once)", () => {
            test_send_request_args('set_once', {
                args: [{'key1': 'val1', 'key2': 'val2'}],
                expected: {$set_once: {'key1': 'val1', 'key2': 'val2'}},
                use_callback: true,
            });
        });

        it("supports being called with a modifiers argument and a callback", () => {
            test_send_request_args('set', {
                args: ['key1', 'val1'],
                expected: {$set: {'key1': 'val1'}},
                use_callback: true,
                use_modifiers: true,
            });
        });

        it("supports being called with a modifiers argument and a callback (set_once)", () => {
            test_send_request_args('set_once', {
                args: ['key1', 'val1'],
                expected: {$set_once: {'key1': 'val1'}},
                use_callback: true,
                use_modifiers: true,
            });
        });

        it("supports being called with a properties object, a modifiers argument and a callback", () => {
            test_send_request_args('set', {
                args: [{'key1': 'val1', 'key2': 'val2'}],
                expected: {$set: {'key1': 'val1', 'key2': 'val2'}},
                use_callback: true,
                use_modifiers: true,
            });
        });

        it("supports being called with a properties object, a modifiers argument and a callback (set_once)", () => {
            test_send_request_args('set_once', {
                args: [{'key1': 'val1', 'key2': 'val2'}],
                expected: {$set_once: {'key1': 'val1', 'key2': 'val2'}},
                use_callback: true,
                use_modifiers: true,
            });
        });
    });

    describe("delete_group", () => {
        it("calls send_request with correct endpoint and data", () => {
            test_send_request_args('delete_group', {
                expected: {$delete: ''},
            });
        });

        it("supports being called with a modifiers argument", () => {
            test_send_request_args('delete_group', {
                expected: {$delete: ''},
                use_modifiers: true,
            });
        });

        it("supports being called with a callback", () => {
            test_send_request_args('delete_group', {
                expected: {$delete: ''},
                use_callback: true,
            });
        });

        it("supports being called with a modifiers argument and a callback", () => {
            test_send_request_args('delete_group', {
                expected: {$delete: ''},
                use_callback: true,
                use_modifiers: true,
            });
        });
    });

    describe("remove", () => {
        it("calls send_request with correct endpoint and data", () => {
            test_send_request_args('remove', {
                args: [{'key1': 'value1', 'key2': 'value2'}],
                expected: {$remove: {'key1': 'value1', 'key2': 'value2'}},
            });
        });

        it("errors on non-scalar argument types", () => {
            mixpanel.groups.remove(group_key, group_id, {'key1': ['value1']});
            mixpanel.groups.remove(group_key, group_id, {key1: {key: 'val'}});
            mixpanel.groups.remove(group_key, group_id, 1231241.123);
            mixpanel.groups.remove(group_key, group_id, [5]);
            mixpanel.groups.remove(group_key, group_id, {key1: function() {}});
            mixpanel.groups.remove(group_key, group_id, {key1: [function() {}]});

            expect(mixpanel.send_request).not.toHaveBeenCalled();
        });

        it("supports being called with a modifiers argument", () => {
            test_send_request_args('remove', {
                args: [{'key1': 'value1'}],
                expected: {$remove: {'key1': 'value1'}},
                use_modifiers: true,
            });
        });

        it("supports being called with a callback", () => {
            test_send_request_args('remove', {
                args: [{'key1': 'value1'}],
                expected: {$remove: {'key1': 'value1'}},
                use_callback: true,
            });
        });

        it("supports being called with a modifiers argument and a callback", () => {
            test_send_request_args('remove', {
                args: [{'key1': 'value1'}],
                expected: {$remove: {'key1': 'value1'}},
                use_callback: true,
                use_modifiers: true,
            });
        });
    });

    describe("union", () => {
        it("calls send_request with correct endpoint and data", () => {
            test_send_request_args('union', {
                args: [{'key1': ['value1', 'value2']}],
                expected: {$union: {'key1': ['value1', 'value2']}},
            });
        });

        it("supports being called with a scalar value", () => {
            test_send_request_args('union', {
                args: [{'key1': 'value1'}],
                expected: {$union: {'key1': ['value1']}},
            });
        });

        it("errors on other argument types", () => {
            mixpanel.groups.union(group_key, group_id, {key1: {key: 'val'}});
            mixpanel.groups.union(group_key, group_id, 1231241.123);
            mixpanel.groups.union(group_key, group_id, [5]);
            mixpanel.groups.union(group_key, group_id, {key1: function() {}});
            mixpanel.groups.union(group_key, group_id, {key1: [function() {}]});

            expect(mixpanel.send_request).not.toHaveBeenCalled();
        });

        it("supports being called with a modifiers argument", () => {
            test_send_request_args('union', {
                args: [{'key1': ['value1', 'value2']}],
                expected: {$union: {'key1': ['value1', 'value2']}},
                use_modifiers: true,
            });
        });

        it("supports being called with a callback", () => {
            test_send_request_args('union', {
                args: [{'key1': ['value1', 'value2']}],
                expected: {$union: {'key1': ['value1', 'value2']}},
                use_callback: true,
            });
        });

        it("supports being called with a modifiers argument and a callback", () => {
            test_send_request_args('union', {
                args: [{'key1': ['value1', 'value2']}],
                expected: {$union: {'key1': ['value1', 'value2']}},
                use_callback: true,
                use_modifiers: true,
            });
        });
    });

    describe("unset", () => {
        it("calls send_request with correct endpoint and data", () => {
            test_send_request_args('unset', {
                args: ['key1'],
                expected: {$unset: ['key1']},
            });
        });

        it("supports being called with a property array", () => {
            test_send_request_args('unset', {
                args: [['key1', 'key2']],
                expected: {$unset: ['key1', 'key2']},
            });
        });

        it("errors on other argument types", () => {
            mixpanel.groups.unset(group_key, group_id, { key1:'val1', key2:'val2' });
            mixpanel.groups.unset(group_key, group_id, 1231241.123);

            expect(mixpanel.send_request).not.toHaveBeenCalled();
        });

        it("supports being called with a modifiers argument", () => {
            test_send_request_args('unset', {
                args: ['key1'],
                expected: {$unset: ['key1']},
                use_modifiers: true,
            });
        });

        it("supports being called with a callback", () => {
            test_send_request_args('unset', {
                args: ['key1'],
                expected: {$unset: ['key1']},
                use_callback: true,
            });
        });

        it("supports being called with a modifiers argument and a callback", () => {
            test_send_request_args('unset', {
                args: ['key1'],
                expected: {$unset: ['key1']},
                use_callback: true,
                use_modifiers: true,
            });
        });
    });
});
