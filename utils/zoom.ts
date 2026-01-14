/**
 * 文件名: zoom.ts
 * 功能: 图像缩放计算工具函数。
 * 核心逻辑:
 * 1. 定义图像缩放状态接口 (ImageZoomState)。
 * 2. 实现 calculateNewZoom 函数，根据鼠标位置和滚轮增量计算新的缩放比例和平移坐标。
 * 3. 限制最大缩放比例并支持重置。
 */

export interface ImageZoomState {
    scale: number;
    panX: number;
    panY: number;
}

export const calculateNewZoom = (
    currentZoom: ImageZoomState,
    mouseX: number, // 相对于图像中心的鼠标 X 坐标
    mouseY: number, // 相对于图像中心的鼠标 Y 坐标
    deltaY: number
): ImageZoomState => {
    const zoomFactor = deltaY > 0 ? 0.75 : 1.25;
    const oldScale = currentZoom.scale;
    const newScale = Math.max(1, Math.min(8, oldScale * zoomFactor)); // 最大 8 倍放大以获得更好的细节

    if (newScale === oldScale) return currentZoom;

    const scaleRatio = newScale / oldScale;
    const newPanX = mouseX - (mouseX - currentZoom.panX) * scaleRatio;
    const newPanY = mouseY - (mouseY - currentZoom.panY) * scaleRatio;

    if (newScale === 1) {
        return { scale: 1, panX: 0, panY: 0 };
    }

    return {
        scale: newScale,
        panX: newPanX,
        panY: newPanY
    };
};