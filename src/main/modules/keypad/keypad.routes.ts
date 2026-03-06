import { KeypadController } from './keypad.controller.ts';
import { Router } from 'express';
import { QueryValidator, Validator } from '../../middleware/validate.middleware.ts';
import { bulk_update_schema, get_switch_setting_schema, keypad_schema, set_individual_switch_group_schema, set_keypad_type_schema, switch_settings_schema, unassigned_schema, updateSchema } from './keypad.schema.ts';

export class KeypadRoutes {
    router = Router();

    private keypadCtrl: KeypadController = new KeypadController();

    constructor() {
        this.router.get('/switch-setting', [QueryValidator(get_switch_setting_schema)], this.keypadCtrl.getSwitchSetting);

        this.router.get('/config/schema', this.keypadCtrl.getKeypadConfig);

        this.router.post('/config/schema', this.keypadCtrl.saveKeypadConfig);

        this.router.get('/check', this.keypadCtrl.checkKeypad);

        this.router.get('/:device_id', this.keypadCtrl.getKeypadById);

        this.router.post('/', [Validator(keypad_schema)], this.keypadCtrl.createKeypad);

        this.router.post('/switch-setting', [Validator(switch_settings_schema)], this.keypadCtrl.setSwitchSettings);

        this.router.post('/unassigned', [Validator(unassigned_schema)], this.keypadCtrl.saveUnassignedKeypad);

        this.router.put('/details/:device_id', [Validator(bulk_update_schema)], this.keypadCtrl.saveKeypadDetail);

        this.router.put('/:device_id', [Validator(updateSchema)], this.keypadCtrl.updateKeypad);

        this.router.delete('/:device_id', this.keypadCtrl.deleteKeypad);

        this.router.delete('/unassigned/all/:device_type', this.keypadCtrl.deleteAllUnnasignedDevice);

        this.router.delete('/unassigned/:device_id', this.keypadCtrl.deleteUnnasignedDevice);

        this.router.post('/type', [Validator(set_keypad_type_schema)], this.keypadCtrl.setKeypadType);

        this.router.post('/reset/:device_id', this.keypadCtrl.setKeypadToDefault);

        this.router.post('/switch-group', [Validator(set_individual_switch_group_schema)], this.keypadCtrl.setIndividualSwitchGroup);

        this.router.get('/switch-group/:device_id', this.keypadCtrl.getIndividualSwitchGroup);

    }

}

