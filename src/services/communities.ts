import type { Community } from "@/features/communities/domain/community-data";
import { localCommunityRepository } from "@/features/communities/services/community-repository";

export const fetchCommunities = (): Promise<Community[]> =>
  localCommunityRepository.fetchAll();

export const fetchCommunityById = (
  communityId: string,
): Promise<Community | null> => localCommunityRepository.fetchById(communityId);
