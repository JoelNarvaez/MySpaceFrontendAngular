import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetalleServicio } from './detalle-servicio';

describe('DetalleServicio', () => {
  let component: DetalleServicio;
  let fixture: ComponentFixture<DetalleServicio>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetalleServicio],
    }).compileComponents();

    fixture = TestBed.createComponent(DetalleServicio);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
