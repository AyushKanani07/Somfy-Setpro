export interface GetChannelMode {
    channel_number: number;
    frequency_mode: 'CE' | 'US';
    application_mode: 'Rolling' | 'Tilting';
    feature_set_mode: 'Normal' | 'Modulis';
}

export interface GetRtsAddress {
    channel_number: number;
    rts_address: string;
}

export interface SetDctLock {
    index: number;
    isLocked: number;
}

export interface SetTiltFrameCount {
    channel: number;
    tilt_frame_us: number;
    tilt_frame_ce: number;
}

export interface SetDimFrameCount {
    channel: number;
    dim_frame: number;
}

export interface setTilt {
    channel: number;
    function_type: number;
    tilt_amplitude: number;
}

export interface ControlDimension {
    channel: number;
    function_type: number;
    dim_amplitude: number;
}

export interface SetChannelMode {
    channel_number: number;
    frequency_mode: number;
    application_mode: number;
    feature_set_mode: number;
}

export interface DataToStore {
    rts_address?: string;
    frequency_mode?: 'us' | 'ce';
    application_mode?: 'rolling' | 'tilting';
    feature_set_mode?: 'modulis' | 'normal';
    tilt_frame_us?: number;
    tilt_frame_ce?: number;
    dim_frame?: number;
    stack_version?: string;
    software_version?: string;
}