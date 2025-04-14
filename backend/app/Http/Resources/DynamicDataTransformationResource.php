<?php
namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DynamicDataTransformationResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $requestedFields = $request->selectedMetrics ?? [];
        $filteredData = ['cas' => $this->cas];

        $transformations = [
            'TS1' => fn() => ($this->TS1 != -128) ? $this->TS1 : null,
            'TS2' => fn() => ($this->TS2 != -128) ? $this->TS2 : null,
            'TS3' => fn() => ($this->TS3 != -128) ? $this->TS3 : null,
            'TS4' => fn() => ($this->TS4 != -128) ? $this->TS4 : null,
            'TS5' => fn() => ($this->TS5 != -128) ? $this->TS5 : null,
            'TS6' => fn() => ($this->TS6 != -128) ? $this->TS6 : null,
            'TS7' => fn() => ($this->TS7 != -128) ? $this->TS7 : null,
            'TS8' => fn() => ($this->TS8 != -128) ? $this->TS8 : null,
            'TS9' => fn() => ($this->TS9 != -128) ? $this->TS9 : null,
            'PTO' => fn() => $this->PTO,
            'PTUV' => fn() => $this->PTUV,
            'PTO2' => fn() => $this->PTO2 ?? null,
            'komp' => fn() => ($this->komp == 0) ? 0 : 10,
            'kvyk' => fn() => $this->kvyk,
            'run' => fn() => ($this->run == 0) ? 0 : 6,
            'reg' => fn() => $this->transformReg($this->reg),
            'vjedn' => fn() => $this->transformVjedn($this->vjedn),
            'dzto' => fn() => $this->transformDzto($this->dzto),
            'dztuv' => fn() => $this->transformDztuv($this->dztuv),
            'tstat' => fn() => ($this->tstat == 0) ? 0 : -2,
            'hdo' => fn() => ($this->hdo == 0) ? 0 : -3,
            'obd' => fn() => ($this->obd == 0) ? 0 : -4,
            'chyba' => fn() => ($this->chyba == 0) ? 0 : -6,
            'PT' => fn() => $this->PT ?? null,
            'PPT' => fn() => $this->PPT ?? null,
            'RPT' => fn() => $this->RPT ?? null,
            'Prtk' => fn() => $this->Prtk ?? null,
            'TpnVk' => fn() => $this->TpnVk ?? null,
        ];

        foreach ($transformations as $key => $transform) {
            if (in_array($key, $requestedFields)) {
                $filteredData[$key] = $transform();
            }
        }

        return $filteredData;
    }

    protected function transformReg($reg)
    {
        return [
            0 => 0,
            1 => 5,
            2 => 3,
            3 => 9,
            4 => 11,
            5 => 7,
            6 => 15,
            7 => 13,
            8 => 17
        ][$reg] ?? $reg;
    }

    protected function transformVjedn($vjedn)
    {
        return [
            0 => 0,
            1 => 2,
            2 => 4,
            3 => 6
        ][$vjedn] ?? $vjedn;
    }

    protected function transformDzto($dzto)
    {
        return [
            0 => 0,
            1 => 4,
            2 => 7,
            3 => 9,
            4 => 11
        ][$dzto] ?? $dzto;
    }

    protected function transformDztuv($dztuv)
    {
        return [
            0 => 0,
            1 => 4,
            2 => 7,
            3 => 9,
            4 => 11
        ][$dztuv] ?? $dztuv;
    }
}