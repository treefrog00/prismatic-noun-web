import StereoKnob from '@/components/stereo/StereoKnob';
import { useStereo } from '@/contexts/StereoContext';

const StereoControl = () => {
    const { currentMode, handleModeChange} = useStereo();

    return (
        <div>
            <StereoKnob onModeChange={handleModeChange} mode={currentMode}/>
        </div>
    );
};

export default StereoControl;