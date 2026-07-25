// LottiePlayer.jsx
import { useEffect, useRef } from 'react';
import lottie from 'lottie-web';

function LottiePlayer({ animationData, loop = true, autoplay = true, className }) {
    const containerRef = useRef(null);

    useEffect(() => {
        if (!containerRef.current) return;

        const instance = lottie.loadAnimation({
            container: containerRef.current,
            renderer: 'svg',
            loop,
            autoplay,
            animationData,
        });

        return () => instance.destroy();
    }, [animationData, loop, autoplay]);

    return <div ref={containerRef} className={className} />;
}

export default LottiePlayer;