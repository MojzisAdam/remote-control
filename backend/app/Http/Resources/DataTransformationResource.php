<?php
namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DataTransformationResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'cas' => $this->cas,
            'TS1' => ($this->TS1 != -128) ? $this->TS1 : null,
            'TS2' => ($this->TS2 != -128) ? $this->TS2 : null,
            'TS3' => ($this->TS3 != -128) ? $this->TS3 : null,
            'TS4' => ($this->TS4 != -128) ? $this->TS4 : null,
            'TS5' => ($this->TS5 != -128) ? $this->TS5 : null,
            'TS6' => ($this->TS6 != -128) ? $this->TS6 : null,
            'TS7' => ($this->TS7 != -128) ? $this->TS7 : null,
            'TS8' => ($this->TS8 != -128) ? $this->TS8 : null,
            'TS9' => ($this->TS9 != -128) ? $this->TS9 : null,
            'PTO' => $this->PTO,
            'PTUV' => $this->PTUV,
            'PTO2' => $this->PTO2 ?? null,
            'komp' => ($this->komp == 0) ? 0 : 10,
            'kvyk' => $this->kvyk,
            'run' => ($this->run == 0) ? 0 : 6,
            'reg' => $this->transformReg($this->reg),
            'vjedn' => $this->transformVjedn($this->vjedn),
            'dzto' => $this->transformDzto($this->dzto),
            'dztuv' => $this->transformDztuv($this->dztuv),
            'tstat' => ($this->tstat == 0) ? 0 : -2,
            'hdo' => ($this->hdo == 0) ? 0 : -3,
            'obd' => ($this->obd == 0) ? 0 : -4,
            'chyba' => ($this->chyba == 0) ? 0 : -6,
            'PT' => $this->PT ?? null,
            'PPT' => $this->PPT ?? null,
            'RPT' => $this->RPT ?? null,
            'Prtk' => $this->Prtk ?? null,
            'TpnVk' => $this->TpnVk ?? null,
        ];
    }

    protected function transformReg($reg)
    {
        $mapping = [
            0 => 0,
            1 => 5,
            2 => 3,
            3 => 9,
            4 => 11,
            5 => 7,
            6 => 15,
            7 => 13,
            8 => 17,
        ];

        return $mapping[$reg] ?? $reg;
    }

    protected function transformVjedn($vjedn)
    {
        $mapping = [
            0 => 0,
            1 => 2,
            2 => 4,
            3 => 6,
        ];

        return $mapping[$vjedn] ?? $vjedn;
    }

    protected function transformDzto($dzto)
    {
        $mapping = [
            0 => 0,
            1 => 4,
            2 => 7,
            3 => 9,
            4 => 11,
        ];

        return $mapping[$dzto] ?? $dzto;
    }

    protected function transformDztuv($dztuv)
    {
        $mapping = [
            0 => 0,
            1 => 4,
            2 => 7,
            3 => 9,
            4 => 11,
        ];

        return $mapping[$dztuv] ?? $dztuv;
    }
}