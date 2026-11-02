import { inject } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  ResolveFn,
  RouterStateSnapshot,
} from '@angular/router';
import { hasValue } from '@dspace/shared/utils/empty.util';
import {
  Observable,
  of,
} from 'rxjs';

import { CommunityDataService } from '../data/community-data.service';
import {
  Community,
  COMMUNITY_PAGE_LINKS_TO_FOLLOW,
} from '../shared/community.model';
import { DSpaceObject } from '../shared/dspace-object.model';
import { FollowLinkConfig } from '../shared/follow-link-config.model';
import {
  DSOBreadcrumbResolver,
  DSOBreadcrumbResolverByUuid,
} from './dso-breadcrumb.resolver';
import { DSOBreadcrumbsService } from './dso-breadcrumbs.service';
import { BreadcrumbConfig } from './models/breadcrumb-config.model';

/**
 * The resolve function that resolves the BreadcrumbConfig object for a Community
 */
export const communityBreadcrumbResolver: ResolveFn<BreadcrumbConfig<Community>> = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot,
  breadcrumbService: DSOBreadcrumbsService = inject(DSOBreadcrumbsService),
  dataService: CommunityDataService = inject(CommunityDataService),
): Observable<BreadcrumbConfig<Community>> => {
  const linksToFollow: FollowLinkConfig<DSpaceObject>[] = COMMUNITY_PAGE_LINKS_TO_FOLLOW as FollowLinkConfig<DSpaceObject>[];
  if (hasValue(route.data.breadcrumbQueryParam)) {
    const parentUuid = route.queryParams[route.data.breadcrumbQueryParam];
    if (hasValue(parentUuid)) {
      return DSOBreadcrumbResolverByUuid(
        route,
        state,
        parentUuid,
        breadcrumbService,
        dataService,
        ...linksToFollow,
      ) as Observable<BreadcrumbConfig<Community>>;
    }
    // A query parameter is configured, but no parent was given (e.g. creating a top-level community):
    // there is nothing to look up, so skip the breadcrumb instead of requesting a community with id 'undefined'
    return of(undefined);
  }
  return DSOBreadcrumbResolver(
    route,
    state,
    breadcrumbService,
    dataService,
    ...linksToFollow,
  ) as Observable<BreadcrumbConfig<Community>>;
};
