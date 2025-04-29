import SlidingRadio from './SlidingRadio';
import StereoKnob from './StereoKnob';
import { useStereo } from '../contexts/StereoContext';

const StereoControl = () => {
    const { currentMode, handleModeChange} = useStereo();

    return (
        <div>
            <StereoKnob onModeChange={handleModeChange} mode={currentMode}/>
            <div className="text-white font-['Cinzel'] text-lg select-none uppercase tracking-wider mt-2 filter drop-shadow">{currentMode}</div>
        </div>
    );
};

export default StereoControl;