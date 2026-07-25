import booleanPointInPolygon from '@turf/boolean-point-in-polygon';
import { point } from '@turf/helpers';
import { MINSK_SUBDISTRICTS, MINSK_DISTRICTS } from '../constants/districts';

export interface GeoLocationResult {
  district: string;
  subdistrict: string;
}

/**
 * Определяет административный район и микрорайон/ЖК по координатам [lng, lat]
 */
export function getDistrictByCoordinates(coordinates?: [number, number]): GeoLocationResult {
  const UNKNOWN = 'Не определено';

  if (!coordinates || coordinates.length !== 2) {
    return { district: UNKNOWN, subdistrict: UNKNOWN };
  }

  const [lng, lat] = coordinates;

  // Проверка валидности географических координат (Минск и окрестности)
  if (lng < 27.0 || lng > 28.0 || lat < 53.0 || lat > 54.0) {
    return { district: 'За пределами Минска', subdistrict: UNKNOWN };
  }

  const aptPoint = point([lng, lat]);

  // 1-й проход: Проверяем точечные микрорайоны и ЖК
  for (const zone of MINSK_SUBDISTRICTS) {
    if (booleanPointInPolygon(aptPoint, zone.polygon)) {
      return {
        district: zone.name,
        subdistrict: zone.subdistrict || UNKNOWN,
      };
    }
  }

  // 2-й проход: Если в микрорайон не попали, ищем хотя бы административный район
  for (const zone of MINSK_DISTRICTS) {
    if (booleanPointInPolygon(aptPoint, zone.polygon)) {
      return {
        district: zone.name,
        subdistrict: UNKNOWN, // 👈 Гарантированно пишем "Не определено"
      };
    }
  }

  return { district: UNKNOWN, subdistrict: UNKNOWN };
}