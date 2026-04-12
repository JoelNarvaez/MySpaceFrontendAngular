import { TestBed } from '@angular/core/testing';

import { Bloqueos } from './bloqueos';

describe('Bloqueos', () => {
  let service: Bloqueos;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Bloqueos);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
