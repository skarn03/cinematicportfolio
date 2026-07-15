import AtmosphereBoundary from "../AtmosphereBoundary";
import VolumetricLightLayer from "./VolumetricLightLayer";
import DustLayer from "./DustLayer";
import CloudShadowLayer from "./CloudShadowLayer";

/** Durbar's own weather: the same warm haze that sits over any open stone
 * square in the afternoon — soft shafts of light through the smog, dust
 * and pigeon-down drifting at head height, and the slow shadow of
 * something (a temple roofline, a passing cloud) sweeping the courtyard.
 * Built entirely from the shared depth layers other chapters already use,
 * just re-tinted toward brick and old bronze instead of cherry-blossom
 * pink or forest green. */
export default function DurbarAtmosphere() {
  return (
    <AtmosphereBoundary>
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <CloudShadowLayer tint="rgba(43,30,20,0.12)" />
        <VolumetricLightLayer color="rgba(232,199,140,0.16)" />
        <DustLayer count={16} color="bg-[#c9a06a]/50" cursorSpeed={16} />
      </div>
    </AtmosphereBoundary>
  );
}
