import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ServiciosSeccion } from './servicios';

describe('Servicios', () => {
  let component: ServiciosSeccion;
  let fixture: ComponentFixture<ServiciosSeccion>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ServiciosSeccion],
    }).compileComponents();

    fixture = TestBed.createComponent(ServiciosSeccion);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
