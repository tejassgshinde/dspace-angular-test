import { getTestScheduler } from 'jasmine-marbles';

import { Community } from '../shared/community.model';
import { createSuccessfulRemoteDataObject$ } from '../utilities/remote-data.utils';
import { communityBreadcrumbResolver } from './community-breadcrumb.resolver';

describe('communityBreadcrumbResolver', () => {
  describe('resolve', () => {
    let resolver: any;
    let communityService: any;
    let dsoBreadcrumbService: any;
    let testCommunity: Community;
    let uuid: string;
    let breadcrumbUrl: string;
    let currentUrl: string;

    beforeEach(() => {
      uuid = '1234-65487-12354-1235';
      breadcrumbUrl = `/communities/${uuid}`;
      currentUrl = `${breadcrumbUrl}/edit`;
      testCommunity = Object.assign(new Community(), {
        uuid: uuid,
        type: 'community',
      });
      dsoBreadcrumbService = {};
      communityService = {
        findById: jasmine.createSpy('findById').and.callFake(() => createSuccessfulRemoteDataObject$(testCommunity)),
      };
      resolver = communityBreadcrumbResolver;
    });

    describe('when a breadcrumbQueryParam is configured but the query parameter is missing', () => {
      it('should not look up a community and should resolve to undefined', () => {
        const route = { data: { breadcrumbQueryParam: 'parent' }, queryParams: {}, params: {} };
        const resolvedConfig = resolver(route as any, { url: currentUrl } as any, dsoBreadcrumbService, communityService);
        getTestScheduler().expectObservable(resolvedConfig).toBe('(a|)', { a: undefined });
        getTestScheduler().flush();
        expect(communityService.findById).not.toHaveBeenCalled();
      });

      it('should also skip the lookup on the create collection route, which shares this resolver and config', () => {
        const route = { data: { breadcrumbQueryParam: 'parent' }, queryParams: {}, params: {} };
        const resolvedConfig = resolver(route as any, { url: '/collections/create' } as any, dsoBreadcrumbService, communityService);
        getTestScheduler().expectObservable(resolvedConfig).toBe('(a|)', { a: undefined });
        getTestScheduler().flush();
        expect(communityService.findById).not.toHaveBeenCalled();
      });
    });

    describe('when a breadcrumbQueryParam is configured and the query parameter is given', () => {
      it('should resolve a breadcrumb config for the parent community', () => {
        const route = { data: { breadcrumbQueryParam: 'parent' }, queryParams: { parent: uuid }, params: {} };
        const resolvedConfig = resolver(route as any, { url: currentUrl } as any, dsoBreadcrumbService, communityService);
        const expectedConfig = { provider: dsoBreadcrumbService, key: testCommunity, url: breadcrumbUrl };
        getTestScheduler().expectObservable(resolvedConfig).toBe('(a|)', { a: expectedConfig });
        getTestScheduler().flush();
        expect(communityService.findById).toHaveBeenCalled();
        expect((communityService.findById as jasmine.Spy).calls.mostRecent().args[0]).toBe(uuid);
      });
    });

    describe('when no breadcrumbQueryParam is configured', () => {
      it('should resolve a breadcrumb config using the id route parameter', () => {
        const route = { data: {}, queryParams: {}, params: { id: uuid } };
        const resolvedConfig = resolver(route as any, { url: currentUrl } as any, dsoBreadcrumbService, communityService);
        const expectedConfig = { provider: dsoBreadcrumbService, key: testCommunity, url: breadcrumbUrl };
        getTestScheduler().expectObservable(resolvedConfig).toBe('(a|)', { a: expectedConfig });
        getTestScheduler().flush();
        expect(communityService.findById).toHaveBeenCalled();
        expect((communityService.findById as jasmine.Spy).calls.mostRecent().args[0]).toBe(uuid);
      });
    });
  });
});
