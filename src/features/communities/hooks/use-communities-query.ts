import { useQuery } from "@tanstack/react-query";
import {
  localCommunityRepository,
  type CommunityRepository,
} from "@/features/communities/services/community-repository";

const defaultRepository = localCommunityRepository;

export const communitiesKeys = {
  all: ["communities"] as const,
  detail: (communityId: string) => ["communities", communityId] as const,
};

export const useCommunitiesQuery = (
  repository: CommunityRepository = defaultRepository,
) =>
  useQuery({
    queryKey: communitiesKeys.all,
    queryFn: repository.fetchAll,
  });

export const useCommunityByIdQuery = (
  communityId: string | undefined,
  repository: CommunityRepository = defaultRepository,
) =>
  useQuery({
    queryKey: communitiesKeys.detail(communityId ?? ""),
    queryFn: () => repository.fetchById(communityId ?? ""),
    enabled: Boolean(communityId),
  });
